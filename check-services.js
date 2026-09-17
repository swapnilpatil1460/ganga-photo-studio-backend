require('dotenv').config();
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  basePrice: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const services = await Service.find({});
    console.log(`Found ${services.length} services in DB.`);
    services.forEach(s => console.log(`- ${s.name}: ₹${s.basePrice}`));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

check();
