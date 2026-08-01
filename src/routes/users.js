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
exports.default = router;
//# sourceMappingURL=users.js.map