"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = __importDefault(require("./app"));
const User_1 = require("./models/User");
const Service_1 = require("./models/Service");
dotenv_1.default.config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret') {
    console.error('FATAL ERROR: JWT_SECRET is not properly configured in the environment variables.');
    process.exit(1);
}
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        if (process.env.MONGODB_URI) {
            console.log('Attempting to connect to MongoDB Atlas...');
            await mongoose_1.default.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB Atlas successfully.');
        }
        else {
            throw new Error("No URI provided");
        }
    }
    catch (err) {
        console.warn('\n⚠️ WARNING: Could not connect to MongoDB Atlas (likely an authentication error).');
        console.warn('⚠️ FALLING BACK to temporary in-memory database so you can continue testing immediately!\n');
        const mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        await mongoose_1.default.connect(mongoServer.getUri());
        console.log('Connected to Temporary In-Memory Database.');
    }
    // Ensure owner account exists (works for both Atlas and in-memory)
    try {
        const existingOwner = await User_1.User.findOne({ email: 'owner@ganga.com' });
        if (!existingOwner) {
            await User_1.User.create({ email: 'owner@ganga.com', password: 'owner123', role: 'owner' });
            console.log('✅ Owner account created (owner@ganga.com / owner123)');
        }
    }
    catch (seedErr) {
        console.warn('⚠️ Could not seed owner account:', seedErr);
    }
    // Ensure default services exist
    try {
        const serviceCount = await Service_1.Service.countDocuments();
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
            await Service_1.Service.insertMany(mockServices);
            console.log('✅ Seeded default services into MongoDB');
        }
    }
    catch (serviceSeedErr) {
        console.warn('⚠️ Could not seed default services:', serviceSeedErr);
    }
    app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
startServer();
//# sourceMappingURL=server.js.map