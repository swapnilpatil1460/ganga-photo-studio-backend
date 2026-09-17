require('dotenv').config();
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  basePrice: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

const services = [
  "Flex Printing",
  "Photographer Flex Printing",
  "Identity / Passport Photo",
  "Photography",
  "CopingPhoto",
  "Mobile Print",
  "Photo Dream",
  "Lamination",
  "Photo Album",
  "Trophy",
  "Mug Printing",
  "Soft Copy/Digital Bord Photo",
  "Wedding Album",
  "Video Shooting",
  "Pre./After Wedding",
  "Drone"
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    let added = 0;
    for (const name of services) {
      const exists = await Service.findOne({ name });
      if (!exists) {
        await Service.create({ name, basePrice: 0 });
        added++;
      }
    }
    
    console.log(`Added ${added} new services`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
