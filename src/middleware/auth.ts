import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    if (decoded?.userId) {
      const dbUser: any = await User.findById(decoded.userId).select('tokenVersion role email');
      if (!dbUser) {
        res.status(401).json({ message: 'User account not found or has been removed' });
        return;
      }
      if (decoded.tokenVersion !== undefined && dbUser.tokenVersion !== undefined && dbUser.tokenVersion !== decoded.tokenVersion) {
        res.status(401).json({ message: 'Session expired or invalidated. Please log in again.' });
        return;
      }
      req.user = { ...decoded, role: dbUser.role, email: dbUser.email };
    } else {
      req.user = decoded;
    }

    next();
  } catch (err) {
    res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    return;
  }
};
