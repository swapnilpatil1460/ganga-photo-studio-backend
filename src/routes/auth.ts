import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
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
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email: String(email) });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      let isMatch = false;
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        // Fallback for legacy plaintext passwords in live DB. If it matches, upgrade it automatically!
        const crypto = require('crypto');
        const userHash = crypto.createHash('sha256').update(user.password || '').digest();
        const reqHash = crypto.createHash('sha256').update(password || '').digest();
        
        if (crypto.timingSafeEqual(userHash, reqHash)) {
           isMatch = true;
           user.password = password; // Triggers the mongoose pre-save hook to hash it
           await user.save();
        }
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '8h' }
      );
      
      user.isOnline = true;
      user.lastActiveAt = new Date();
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

      res.json({ user: { email: user.email, role: user.role } });
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
