"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET current user's settings
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user.settings || {});
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
});
// PUT update current user's settings
router.put('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        user.settings = { ...user.settings, ...req.body };
        await user.save();
        res.json(user.settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map