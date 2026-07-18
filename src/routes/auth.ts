import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { mockUsers } from './users';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    if (email === 'owner@ganga.com' && password === 'owner123') {
      const token = jwt.sign(
        { email, role: 'owner' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '8h' }
      );
      res.json({ token, user: { email, role: 'owner' } });
      return;
    }

    if (email === 'emp@ganga.com' && password === 'emp123') {
      const token = jwt.sign(
        { email, role: 'employee' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '8h' }
      );
      res.json({ token, user: { email, role: 'employee' } });
      return;
    }

    // Keep old admin demo working just in case
    if (email === 'admin@ganga.com' && password === 'admin123') {
      const token = jwt.sign(
        { email, role: 'owner' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '8h' }
      );
      res.json({ token, user: { email, role: 'owner' } });
      return;
    }

    if (process.env.MONGODB_URI) {
      const user = await User.findOne({ email });
      if (user && user.password === password) {
        const token = jwt.sign(
          { userId: user._id, email, role: user.role },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '8h' }
        );
        res.json({ token, user: { email: user.email, role: user.role } });
        return;
      }
    } else {
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser && mockUser.password === password) {
        const token = jwt.sign(
          { userId: mockUser._id, email, role: mockUser.role },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '8h' }
        );
        res.json({ token, user: { email: mockUser.email, role: mockUser.role } });
        return;
      }
    }

    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
