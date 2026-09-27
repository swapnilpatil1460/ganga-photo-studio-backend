import express from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { BackupSettings } from '../models/BackupSettings';
import { BackupRecord } from '../models/BackupRecord';
import { runBackup, getLocalBackupDir, restoreFromFile, encryptString } from '../services/backup.service';
import { extractFolderId, isOAuthConfigured, getAuthUrl, exchangeCode } from '../services/googleDrive.service';
import { reschedule } from '../services/backupScheduler.service';

const router = express.Router();

// Public OAuth Callback from Google Cloud (Google redirects the owner here)
router.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send('Missing authorization code from Google.');
    }

    const { refreshToken, email } = await exchangeCode(code);
    await BackupSettings.findOneAndUpdate(
      {},
      {
        encryptedRefreshToken: encryptString(refreshToken),
        driveConnected: true,
        connectedEmail: email,
      },
      { upsert: true }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'https://ganga-photo-studio-frontend-srock.vercel.app';
    res.redirect(`${frontendUrl.replace(/\/$/, '')}/dashboard/backup?google_connected=true`);
  } catch (error: any) {
    console.error('[Backup OAuth] Callback failed:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'https://ganga-photo-studio-frontend-srock.vercel.app';
    res.redirect(`${frontendUrl.replace(/\/$/, '')}/dashboard/backup?google_error=${encodeURIComponent(error.message || 'OAuth error')}`);
  }
});

// All subsequent backup routes require Owner role
router.use(authenticateToken, requireRole(['owner']));

// GET backup settings
router.get('/settings', async (_req, res) => {
  try {
    let settings = await BackupSettings.findOne();
    if (!settings) settings = await BackupSettings.create({});
    const safe = settings.toObject();
    delete (safe as any).encryptedRefreshToken;
    res.json({
      ...safe,
      oauthConfigured: isOAuthConfigured(),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching backup settings', error: error.message });
  }
});

// PUT update backup settings
router.put('/settings', async (req, res) => {
  try {
    const allowed = ['enabled', 'frequency', 'backupTime', 'weekDay', 'retention', 'folderName', 'googleDriveLink'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (req.body.googleDriveLink !== undefined) {
      update.googleDriveFolderId = extractFolderId(req.body.googleDriveLink) || '';
    }

    const settings = await BackupSettings.findOneAndUpdate({}, update, { new: true, upsert: true });
    const safe = settings!.toObject();
    delete (safe as any).encryptedRefreshToken;

    // Reschedule background cron job with updated schedule
    await reschedule();

    res.json({
      message: 'Backup settings updated and scheduler refreshed',
      settings: {
        ...safe,
        oauthConfigured: isOAuthConfigured(),
      }
    });
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

// GET Google OAuth authorization URL
router.get('/auth/url', async (_req, res) => {
  try {
    if (!isOAuthConfigured()) {
      return res.status(400).json({
        configured: false,
        message: 'Google Cloud OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) are not configured on the server yet.'
      });
    }
    const url = getAuthUrl();
    res.json({ configured: true, url });
  } catch (error: any) {
    res.status(500).json({ message: 'Error generating Google auth URL', error: error.message });
  }
});

// POST disconnect Google Drive
router.post('/disconnect-drive', async (_req, res) => {
  try {
    await BackupSettings.findOneAndUpdate(
      {},
      {
        $unset: { encryptedRefreshToken: 1, connectedEmail: 1 },
        driveConnected: false,
      }
    );
    res.json({ message: 'Google Drive disconnected successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error disconnecting Google Drive', error: error.message });
  }
});

export default router;
