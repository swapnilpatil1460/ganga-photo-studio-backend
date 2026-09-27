import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import mongoose from 'mongoose';
import { BackupRecord } from '../models/BackupRecord';
import { BackupSettings } from '../models/BackupSettings';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const ALGORITHM = 'aes-256-gcm';

// Derive 32-byte key securely from environment variables
function getKey(): Buffer {
  const secretSource = process.env.BACKUP_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'ganga_photo_studio_secure_backup_key_fallback';
  return crypto.createHash('sha256').update(secretSource).digest();
}

export function encryptBuffer(data: Buffer): Buffer {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Layout: [iv (16)] [authTag (16)] [ciphertext]
  return Buffer.concat([iv, authTag, encrypted]);
}

export function decryptBuffer(data: Buffer): Buffer {
  if (data.length < 32) {
    throw new Error('Invalid encrypted backup payload: buffer too short');
  }
  const key = getKey();
  const iv = data.subarray(0, 16);
  const authTag = data.subarray(16, 32);
  const ct = data.subarray(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

export function getLocalBackupDir(): string {
  const dir = process.env.LOCAL_BACKUP_DIR || path.join(process.cwd(), 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function saveLocalBackup(filename: string, buffer: Buffer): string {
  const dir = getLocalBackupDir();
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function pruneLocalBackups(keep: number) {
  if (keep <= 0) return;
  const dir = getLocalBackupDir();
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.gz.enc'))
    .map(f => ({ name: f, path: path.join(dir, f), time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (files.length > keep) {
    const toRemove = files.slice(keep);
    for (const file of toRemove) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.warn(`[Backup] Could not delete old local backup ${file.name}:`, err);
      }
    }
  }
}

export async function exportAllCollections(): Promise<Buffer> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('No active MongoDB connection');

  const collections = await db.listCollections().toArray();
  const snapshot: Record<string, unknown[]> = {};

  for (const col of collections) {
    if (col.name.startsWith('system.')) continue;
    const docs = await db.collection(col.name).find({}).toArray();
    snapshot[col.name] = docs;
  }

  return Buffer.from(JSON.stringify(snapshot, null, 2), 'utf8');
}

export async function runBackup(triggeredBy: 'scheduled' | 'manual', performedBy: string) {
  let settings = await BackupSettings.findOne();
  if (!settings) {
    settings = await BackupSettings.create({});
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  const filename = `Ganga-Backup-${dateStr}-${timeStr}.gz.enc`;

  const record = await BackupRecord.create({
    filename,
    sizeBytes: 0,
    status: 'failed',
    driveUploadStatus: 'skipped',
    triggeredBy,
    performedBy,
  });

  try {
    // 1. Export database snapshot
    const raw = await exportAllCollections();

    // 2. Compress with gzip
    const compressed = await gzip(raw);

    // 3. Encrypt with AES-256-GCM
    const encrypted = encryptBuffer(compressed);

    record.sizeBytes = encrypted.length;

    // 4. Save local backup copy
    saveLocalBackup(filename, encrypted);

    // 5. Prune older backups according to retention
    pruneLocalBackups(settings.retention || 7);

    // 6. Update record to success
    record.status = 'success';
    await record.save();

    settings.lastBackupAt = now;
    settings.lastBackupStatus = 'success';
    await settings.save();

    return record;
  } catch (err: any) {
    record.status = 'failed';
    record.errorMessage = err.message || 'Unknown error during backup';
    await record.save();

    settings.lastBackupAt = now;
    settings.lastBackupStatus = 'failed';
    await settings.save();

    throw err;
  }
}

export async function restoreFromBuffer(
  encryptedBuffer: Buffer,
  targetMongoUri?: string
): Promise<{ restoredCollections: Record<string, number> }> {
  // 1. Decrypt
  const decrypted = decryptBuffer(encryptedBuffer);

  // 2. Decompress
  const decompressed = await gunzip(decrypted);

  // 3. Parse & Validate
  let snapshot: Record<string, unknown[]>;
  try {
    snapshot = JSON.parse(decompressed.toString('utf8'));
  } catch (parseErr) {
    throw new Error('Corrupted backup archive: unable to parse JSON snapshot');
  }

  if (typeof snapshot !== 'object' || snapshot === null) {
    throw new Error('Invalid backup format: root must be an object of collections');
  }

  // 4. Restore target database
  let targetDb: mongoose.mongo.Db;
  let customClient: mongoose.mongo.MongoClient | null = null;

  if (targetMongoUri) {
    customClient = new mongoose.mongo.MongoClient(targetMongoUri);
    await customClient.connect();
    targetDb = customClient.db();
  } else {
    if (!mongoose.connection.db) {
      throw new Error('No active database connection available for restore');
    }
    targetDb = mongoose.connection.db;
  }

  const restoredCollections: Record<string, number> = {};

  try {
    for (const [colName, docs] of Object.entries(snapshot)) {
      if (!Array.isArray(docs)) continue;

      const col = targetDb.collection(colName);
      // Clean existing records in target collection
      await col.deleteMany({});

      if (docs.length > 0) {
        await col.insertMany(docs as any[]);
      }
      restoredCollections[colName] = docs.length;
    }
  } finally {
    if (customClient) {
      await customClient.close();
    }
  }

  return { restoredCollections };
}

export async function restoreFromFile(
  filePath: string,
  targetMongoUri?: string
): Promise<{ restoredCollections: Record<string, number> }> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file does not exist at path: ${filePath}`);
  }
  const buffer = fs.readFileSync(filePath);
  return restoreFromBuffer(buffer, targetMongoUri);
}
