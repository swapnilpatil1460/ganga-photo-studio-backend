import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './app';
import bcrypt from 'bcryptjs';
import { User } from './models/User';

dotenv.config();

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
    
    // Inject the owner account into the temporary DB (pre-save hook will hash it!)
    await User.create({ email: 'owner@ganga.com', password: 'owner123', role: 'owner' });
    console.log('✅ Temporary Owner account created (owner@ganga.com / owner123)');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
