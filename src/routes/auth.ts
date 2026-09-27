import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { ActivityLog } from '../models/ActivityLog';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50,
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/login',
  loginLimiter,
  [
    body('email').trim().notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), message: errors.array()[0].msg });
      }

      const input = String(req.body.email || '').trim();
      const inputLower = input.toLowerCase();
      const rawPassword = String(req.body.password || '').trim();

      // 1. Search for user by email (case-insensitive)
      let user = await User.findOne({
        email: { $regex: new RegExp('^' + inputLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      }).select('+password +encryptedPassword +tokenVersion');

      // 2. Allow 'admin' or 'admin@ganga.com' or 'owner' alias for owner
      if (!user && (inputLower === 'admin' || inputLower === 'admin@ganga.com' || inputLower === 'owner')) {
        user = await User.findOne({ role: 'owner' }).select('+password +encryptedPassword +tokenVersion');
      }

      // 3. Search by employee phone number
      if (!user) {
        const cleanPhone = input.replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 10) {
          const emp = await Employee.findOne({ phone: { $regex: new RegExp(cleanPhone.slice(-10) + '$') } });
          if (emp && emp.email) {
            user = await User.findOne({
              email: { $regex: new RegExp('^' + emp.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
            }).select('+password +encryptedPassword +tokenVersion');
          }
        }
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found. Please check your email.' });
      }

      let isMatch = false;
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
        isMatch = await bcrypt.compare(rawPassword, user.password);
        if (!isMatch && rawPassword !== req.body.password) {
          isMatch = await bcrypt.compare(req.body.password, user.password);
        }
        if (!isMatch && rawPassword.toLowerCase() !== rawPassword) {
          isMatch = await bcrypt.compare(rawPassword.toLowerCase(), user.password);
        }
      } else {
        // Fallback for legacy plaintext passwords in live DB. If it matches, upgrade it automatically!
        const crypto = require('crypto');
        const userHash = crypto.createHash('sha256').update(user.password || '').digest();
        const reqHash = crypto.createHash('sha256').update(rawPassword || '').digest();
        
        if (crypto.timingSafeEqual(userHash, reqHash)) {
           isMatch = true;
           user.password = rawPassword; // Triggers the mongoose pre-save hook to hash it
           await user.save();
        }
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role, tokenVersion: (user as any).tokenVersion || 0 },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h' }
      );
      
      user.isOnline = true;
      user.lastActiveAt = new Date();
      user.lastLoginAt = new Date();
      await user.save();
      
      await ActivityLog.create({
        user: user._id,
        email: user.email,
        action: 'Logged in',
        details: 'User logged into the system',
        ipAddress: req.ip
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 8 * 60 * 60 * 1000 // 8 hours
      });

      res.json({ token, user: { email: user.email, role: user.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        const user = await User.findById(decoded.userId);
        if (user) {
          user.isOnline = false;
          user.lastActiveAt = new Date();
          (user as any).tokenVersion = ((user as any).tokenVersion || 0) + 1;
          await user.save();
          
          await ActivityLog.create({
            user: user._id,
            email: user.email,
            action: 'Logged out',
            details: 'User logged out of the system',
            ipAddress: req.ip
          });
        }
      } catch (err) {
        // Token invalid or expired, just proceed to clear cookie
      }
    }
  } catch (error) {
    console.error('Logout logging error:', error);
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Logged out successfully' });
});

router.post('/ping', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      await User.findByIdAndUpdate(decoded.userId, {
        isOnline: true,
        lastActiveAt: new Date()
      });
    }
  } catch (error) {
    // Ignore errors for ping
  }
  res.json({ status: 'ok' });
});

export default router;
