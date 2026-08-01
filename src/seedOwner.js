"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("./models/User");
dotenv_1.default.config();
async function seed() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || '');
        console.log('Connected to DB');
        const email = 'owner@ganga.com';
        const password = 'owner123';
        // Check if exists
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            console.log('Owner user already exists. Updating password to owner123...');
            existing.password = password; // Pre-save hook will hash it!
            await existing.save();
            console.log('Owner password updated.');
        }
        else {
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            const user = new User_1.User({
                email,
                password: hashedPassword, // Note: the pre-save hook will hash it AGAIN if we set it in plaintext, wait...
                role: 'owner'
            });
            // Actually, since I added a pre-save hook, I should just set plaintext and let the hook hash it!
            const userToSave = new User_1.User({
                email,
                password, // Plaintext, hook will hash
                role: 'owner'
            });
            await userToSave.save();
            console.log('Owner user created.');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seedOwner.js.map