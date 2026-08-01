import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Service } from '../models/Service';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const services = await Service.find({}).sort({ name: 1 });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching services', error: error.message || 'Unknown error' });
  }
});

export default router;
