import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // 'wedding', 'pre_wedding', etc.
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:MM
  endTime: { type: String, required: true }, // HH:MM
  location: { type: String },
  customerName: { type: String },
  customerNumber: { type: String },
  assignedTo: { type: String }, // Stored as comma-separated string for simplicity
  notes: { type: String },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

scheduleSchema.index({ date: 1, startTime: 1 });

export const Schedule = mongoose.model('Schedule', scheduleSchema);
