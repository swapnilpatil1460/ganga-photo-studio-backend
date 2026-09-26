import express from 'express';
import { ActivityLog } from '../models/ActivityLog';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = express.Router();

// GET all activity logs (Owner only)
router.get('/', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
  }
});

export default router;
