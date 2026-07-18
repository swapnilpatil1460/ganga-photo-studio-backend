import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer } from './src/models/Customer';
import { Employee } from './src/models/Employee';

dotenv.config();

async function clearOldData() {
  if (!process.env.MONGODB_URI) {
    console.log('No MONGODB_URI found.');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Delete dummy employees (e.g. John Editor, Sarah Photo, or all?)
    // Let's just wipe the collections since it's early development and they want them cleared
    await Customer.deleteMany({});
    console.log('All customer entries removed.');

    await Employee.deleteMany({});
    console.log('All employee entries removed.');

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error(err);
  }
}

clearOldData();
