import express from 'express';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Passwords are now hashed and properly excluded from API responses for security.
    const users = await User.find({}).select('-password').sort({ _id: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message || 'Unknown error' });
  }
});

// DELETE a user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message || 'Unknown error' });
  }
});

export default router;
