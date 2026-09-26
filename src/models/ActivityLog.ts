import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'Logged In', 'Created Order'
  details: { type: String }, // Optional extra info
  ipAddress: { type: String }, // Optional
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries sorted by newest
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
