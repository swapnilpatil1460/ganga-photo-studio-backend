import { Schema, model, Document } from 'mongoose';

export interface BackupRecordDocument extends Document {
  filename: string;
  sizeBytes: number;
  status: 'success' | 'failed';
  driveFileId?: string;
  driveUploadStatus: 'uploaded' | 'failed' | 'skipped';
  errorMessage?: string;
  triggeredBy: 'scheduled' | 'manual';
  performedBy: string;
  createdAt: Date;
}

const backupRecordSchema = new Schema<BackupRecordDocument>(
  {
    filename:          { type: String,  required: true },
    sizeBytes:         { type: Number,  default: 0 },
    status:            { type: String,  enum: ['success', 'failed'], required: true },
    driveFileId:       { type: String },
    driveUploadStatus: { type: String,  enum: ['uploaded', 'failed', 'skipped'], default: 'skipped' },
    errorMessage:      { type: String },
    triggeredBy:       { type: String,  enum: ['scheduled', 'manual'], required: true },
    performedBy:       { type: String,  required: true },
  },
  { timestamps: true }
);

backupRecordSchema.index({ createdAt: -1 });

export const BackupRecord = model<BackupRecordDocument>('BackupRecord', backupRecordSchema);
