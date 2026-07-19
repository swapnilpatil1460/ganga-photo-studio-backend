import express from 'express';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    // For this specific requirement, we return the password so the owner can see it.
    // Note: In a real-world production app, passwords should be hashed and never returned in plain text.
    const users = await User.find({}).sort({ _id: -1 });
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
