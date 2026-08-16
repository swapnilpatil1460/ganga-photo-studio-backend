import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  basePrice: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' }
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);
