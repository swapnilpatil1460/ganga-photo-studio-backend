import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from './app';
import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { Service } from './models/Service';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret') {
  console.error('FATAL ERROR: JWT_SECRET is not properly configured in the environment variables.');
  process.exit(1);
}

if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
  console.error('FATAL ERROR: ENCRYPTION_KEY is not properly configured in the environment variables (must be at least 32 characters).');
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
    if (process.env.INITIAL_ADMIN_EMAIL && process.env.INITIAL_ADMIN_PASSWORD) {
      const existingOwner = await User.findOne({ email: process.env.INITIAL_ADMIN_EMAIL });
      if (!existingOwner) {
        await User.create({ email: process.env.INITIAL_ADMIN_EMAIL, password: process.env.INITIAL_ADMIN_PASSWORD, role: 'owner' });
        console.log(`✅ Owner account created (${process.env.INITIAL_ADMIN_EMAIL})`);
      }
    }
  } catch (seedErr) {
    console.warn('⚠️ Could not seed owner account:', seedErr);
  }

  // Ensure default services exist
  try {
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const mockServices = [
        { name: 'Flex Printing', basePrice: 500 },
        { name: 'Photographer Flex Printing', basePrice: 600 },
        { name: 'Identity / Passport Photo', basePrice: 150 },
        { name: 'Photography', basePrice: 5000 },
        { name: 'CopingPhoto', basePrice: 50 },
        { name: 'Mobile Print', basePrice: 20 },
        { name: 'Photo Dream', basePrice: 2000 },
        { name: 'Lamination', basePrice: 50 },
        { name: 'Photo Album', basePrice: 3000 },
        { name: 'Trophy', basePrice: 400 },
        { name: 'Mug Printing', basePrice: 250 },
        { name: 'Soft Copy/Digital Bord Photo', basePrice: 100 },
        { name: 'Wedding Album', basePrice: 15000 },
        { name: 'Video Shooting', basePrice: 10000 },
        { name: 'Pre./After Wedding', basePrice: 8000 },
        { name: 'Drone', basePrice: 5000 }
      ];
      await Service.insertMany(mockServices);
      console.log('✅ Seeded default services into MongoDB');
    }
  } catch (serviceSeedErr) {
    console.warn('⚠️ Could not seed default services:', serviceSeedErr);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
