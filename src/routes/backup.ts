import express from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { BackupSettings } from '../models/BackupSettings';
import { BackupRecord } from '../models/BackupRecord';
import { runBackup, getLocalBackupDir, restoreFromFile } from '../services/backup.service';

const router = express.Router();

// All backup routes require Owner role
router.use(authenticateToken, requireRole(['owner']));

// GET backup settings
router.get('/settings', async (_req, res) => {
  try {
    let settings = await BackupSettings.findOne();
    if (!settings) settings = await BackupSettings.create({});
    const safe = settings.toObject();
    delete (safe as any).encryptedRefreshToken;
    res.json(safe);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching backup settings', error: error.message });
  }
});

// PUT update backup settings
router.put('/settings', async (req, res) => {
  try {
    const allowed = ['enabled', 'frequency', 'backupTime', 'weekDay', 'retention', 'folderName'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const settings = await BackupSettings.findOneAndUpdate({}, update, { new: true, upsert: true });
    const safe = settings!.toObject();
    delete (safe as any).encryptedRefreshToken;
    res.json({ message: 'Backup settings updated', settings: safe });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating backup settings', error: error.message });
  }
});

// POST run manual backup
router.post('/run', async (req: any, res) => {
  try {
    const performedBy = req.user?.email || 'Owner';
    const record = await runBackup('manual', performedBy);
    res.json({ message: 'Encrypted backup created successfully', record });
  } catch (error: any) {
    res.status(500).json({ message: 'Backup failed', error: error.message || 'Unknown error' });
  }
});

// GET backup history
router.get('/history', async (_req, res) => {
  try {
    const records = await BackupRecord.find().sort({ createdAt: -1 }).limit(50);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching backup history', error: error.message });
  }
});

// GET download encrypted backup file
router.get('/download/:id', async (req, res) => {
  try {
    const record = await BackupRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Backup record not found' });

    const dir = getLocalBackupDir();
    const filePath = path.join(dir, record.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found on server' });
    }

    res.download(filePath, record.filename);
  } catch (error: any) {
    res.status(500).json({ message: 'Error downloading backup', error: error.message });
  }
});

// POST restore from recorded backup
router.post('/restore/:id', async (req, res) => {
  try {
    const record = await BackupRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Backup record not found' });

    const dir = getLocalBackupDir();
    const filePath = path.join(dir, record.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found on server' });
    }

    const result = await restoreFromFile(filePath);
    res.json({ message: 'Restoration completed successfully', restoredCollections: result.restoredCollections });
  } catch (error: any) {
    res.status(500).json({ message: 'Restoration failed', error: error.message || 'Unknown error' });
  }
});

// DELETE a backup record
router.delete('/history/:id', async (req, res) => {
  try {
    const record = await BackupRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Backup record not found' });

    const dir = getLocalBackupDir();
    const filePath = path.join(dir, record.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }

    await record.deleteOne();
    res.json({ message: 'Backup record and archive deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting backup record', error: error.message });
  }
});

export default router;
