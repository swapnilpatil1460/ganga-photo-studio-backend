import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './app';
import bcrypt from 'bcryptjs';
import { User } from './models/User';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret') {
  console.error('FATAL ERROR: JWT_SECRET is not properly configured in the environment variables.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      console.log('Attempting to connect to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas successfully.');
    } else {
      throw new Error("No URI provided");
    }
  } catch (err) {
    console.warn('\n⚠️ WARNING: Could not connect to MongoDB Atlas (likely an authentication error).');
    console.warn('⚠️ FALLING BACK to temporary in-memory database so you can continue testing immediately!\n');
    
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('Connected to Temporary In-Memory Database.');
  }

  // Ensure owner account exists (works for both Atlas and in-memory)
  try {
    const existingOwner = await User.findOne({ email: 'owner@ganga.com' });
    if (!existingOwner) {
      await User.create({ email: 'owner@ganga.com', password: 'owner123', role: 'owner' });
      console.log('✅ Owner account created (owner@ganga.com / owner123)');
    }
  } catch (seedErr) {
    console.warn('⚠️ Could not seed owner account:', seedErr);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
