import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { Service } from '../models/Service';

const router = express.Router();

// GET all services (accessible by any authenticated user)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const services = await Service.find({}).sort({ name: 1 });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching services', error: error.message || 'Unknown error' });
  }
});

// POST new service (owner only)
router.post('/', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const { name, basePrice, description } = req.body;
    if (!name || basePrice === undefined) {
      return res.status(400).json({ message: 'Name and Base Price are required' });
    }
    const service = new Service({ name, basePrice, description });
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A service with this name already exists' });
    }
    res.status(400).json({ message: 'Error creating service', error: error.message || 'Unknown error' });
  }
});

// PUT update service (owner only)
router.put('/:id', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const { name, basePrice, description } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id, 
      { name, basePrice, description }, 
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A service with this name already exists' });
    }
    res.status(400).json({ message: 'Error updating service', error: error.message || 'Unknown error' });
  }
});

// DELETE service (owner only)
router.delete('/:id', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting service', error: error.message || 'Unknown error' });
  }
});

export default router;
