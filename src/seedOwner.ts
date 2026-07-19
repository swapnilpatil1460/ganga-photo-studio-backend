import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to DB');

    const email = 'owner@ganga.com';
    const password = 'owner123';
    
    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Owner user already exists. Updating password to owner123...');
      existing.password = password; // Pre-save hook will hash it!
      await existing.save();
      console.log('Owner password updated.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new User({
        email,
        password: hashedPassword, // Note: the pre-save hook will hash it AGAIN if we set it in plaintext, wait...
        role: 'owner'
      });
      // Actually, since I added a pre-save hook, I should just set plaintext and let the hook hash it!
      const userToSave = new User({
        email,
        password, // Plaintext, hook will hash
        role: 'owner'
      });
      await userToSave.save();
      console.log('Owner user created.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seed();
