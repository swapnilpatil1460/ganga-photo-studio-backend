import { Schema, model, Document } from 'mongoose';

export interface BackupSettingsDocument extends Document {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  backupTime: string;           // HH:mm 24h
  weekDay: number;              // 0=Sun … 6=Sat
  retention: number;            // 7 | 30 | -1 (keep all)
  folderName: string;
  encryptedRefreshToken?: string;
  driveConnected: boolean;
  connectedEmail?: string;
  lastBackupAt?: Date;
  lastBackupStatus?: 'success' | 'failed';
}

const backupSettingsSchema = new Schema<BackupSettingsDocument>(
  {
    enabled:                { type: Boolean,  default: false },
    frequency:              { type: String,   enum: ['daily', 'weekly'], default: 'daily' },
    backupTime:             { type: String,   default: '02:00' },
    weekDay:                { type: Number,   default: 0, min: 0, max: 6 },
    retention:              { type: Number,   default: 7 },
    folderName:             { type: String,   default: 'Photo Studio ERP Backups' },
    encryptedRefreshToken:  { type: String },
    driveConnected:         { type: Boolean,  default: false },
    connectedEmail:         { type: String },
    lastBackupAt:           { type: Date },
    lastBackupStatus:       { type: String,   enum: ['success', 'failed'] },
  },
  { timestamps: true }
);

export const BackupSettings = model<BackupSettingsDocument>('BackupSettings', backupSettingsSchema);
