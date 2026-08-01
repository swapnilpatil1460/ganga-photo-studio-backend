"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = express_1.default.Router();
// GET all users
router.get('/', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), async (req, res) => {
    try {
        // Passwords are now hashed and properly excluded from API responses for security.
        const users = await User_1.User.find({}).select('-password').sort({ _id: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message || 'Unknown error' });
    }
});
// DELETE a user
router.delete('/:id', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), async (req, res) => {
    try {
        const deletedUser = await User_1.User.findByIdAndDelete(req.params.id);
        if (!deletedUser)
            return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message || 'Unknown error' });
    }
});
// POST reset password for user directly
router.post('/:id/reset-password', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const generatePassword = (email) => {
            const baseName = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
            const prefix = baseName ? (baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase()) : 'User';
            const numbers = "0123456789";
            const symbols = "!@#$%^&*";
            let suffix = "";
            for (let i = 0; i < 3; i++)
                suffix += numbers[Math.floor(Math.random() * 10)];
            suffix += symbols[Math.floor(Math.random() * symbols.length)];
            let password = prefix + suffix;
            while (password.length < 8) {
                password += numbers[Math.floor(Math.random() * 10)];
            }
            return password;
        };
        const newPassword = generatePassword(user.email);
        user.password = newPassword;
        await user.save(); // User schema has a pre-save hook that hashes the password
        res.json({ message: 'Password reset successfully', credentials: { email: user.email, password: newPassword } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message || 'Unknown error' });
    }
});
// GET password for user (Owner only)
router.get('/:id/password', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (!user.encryptedPassword)
            return res.status(400).json({ message: 'Password is encrypted with older one-way hash. Please reset the password once to enable viewing.' });
        const decrypted = require('../utils/crypto').decrypt(user.encryptedPassword);
        res.json({ credentials: { email: user.email, password: decrypted } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving password', error: error.message || 'Unknown error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map