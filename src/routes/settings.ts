import express from 'express';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

import { body, validationResult } from 'express-validator';
import { validateRequest } from '../middleware/validators';

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

const settingsValidators = [
  body('theme').optional().trim(),
  body('studioName').optional().trim(),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('gstId').optional().trim()
];

// PUT update current user's settings
router.put('/', authenticateToken, settingsValidators, validateRequest, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const { theme, studioName, email, phone, address, gstId } = req.body;
    const updates: any = {};
    if (theme !== undefined) updates.theme = theme;
    if (studioName !== undefined) updates.studioName = studioName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (gstId !== undefined) updates.gstId = gstId;

    user.settings = { ...user.settings, ...updates };
    await user.save();
    
    res.json(user.settings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

export default router;
