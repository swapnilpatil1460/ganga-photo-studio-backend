import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';
import { encrypt } from '../utils/crypto';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  encryptedPassword: { type: String, required: false },
  role: { type: String, enum: ['owner', 'employee', 'customer'], default: 'employee' },
  settings: {
    theme: { type: String, default: 'theme-dashboard' },
    studioName: { type: String, default: 'Ganga Photo Studio' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    gstId: { type: String, default: '' }
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  // Encrypt the plaintext password symmetrically so the Owner can view it later
  this.encryptedPassword = encrypt(this.password);
  
  // Hash the password with bcrypt for secure authentication
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = mongoose.model('User', userSchema);
