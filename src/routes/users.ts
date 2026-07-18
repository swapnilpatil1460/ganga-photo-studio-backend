import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

export let mockUsers: any[] = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      // For this specific requirement, we return the password so the owner can see it.
      // Note: In a real-world production app, passwords should be hashed and never returned in plain text.
      const users = await User.find({}).sort({ _id: -1 });
      res.json(users);
    } else {
      // Return mock users with passwords
      res.json(mockUsers);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message || 'Unknown error' });
  }
});

// DELETE a user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } else {
      const index = mockUsers.findIndex(u => u._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'User not found' });
      mockUsers.splice(index, 1);
      res.json({ message: 'User deleted (mock)' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting user', error: error.message || 'Unknown error' });
  }
});

export default router;
