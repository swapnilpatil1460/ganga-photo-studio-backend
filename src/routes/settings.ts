import express from 'express';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET current user's settings
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.settings || {});
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// PUT update current user's settings
router.put('/', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.settings = { ...user.settings, ...req.body };
    await user.save();
    
    res.json(user.settings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

export default router;
