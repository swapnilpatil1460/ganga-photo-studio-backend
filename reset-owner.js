const mongoose = require('mongoose');
require('dotenv').config();

async function resetOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // We need to require the User model, but since it's TS, we can just do a raw update
    // But wait, if we just set password, we need it hashed.
    // Let's use bcrypt here.
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('owner123', salt);
    
    // Also symmetric encryption for encryptedPassword if used
    const crypto = require('crypto');
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
    const IV_LENGTH = 16;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update('owner123');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encryptedPassword = iv.toString('hex') + ':' + encrypted.toString('hex');
    
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    let owner = await users.findOne({ email: 'owner@ganga.com' });
    if (!owner) {
      console.log('Owner not found, creating one...');
      await users.insertOne({
        email: 'owner@ganga.com',
        password: hash,
        encryptedPassword: encryptedPassword,
        role: 'owner',
        settings: {
          theme: 'theme-dashboard',
          studioName: 'Ganga Photo Studio'
        }
      });
    } else {
      console.log('Owner found, resetting password...');
      await users.updateOne(
        { email: 'owner@ganga.com' },
        { $set: { password: hash, encryptedPassword: encryptedPassword } }
      );
    }
    console.log('Successfully set owner@ganga.com password to owner123');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

resetOwner();
