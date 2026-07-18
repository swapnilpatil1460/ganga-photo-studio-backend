import express from 'express';
import { Schedule } from '../models/Schedule';
import { authenticateToken } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

let mockSchedules: any[] = [];

// Get all schedules
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!isDbConnected()) return res.json(mockSchedules);
    const schedules = await Schedule.find({}).sort({ date: 1, startTime: 1 });
    // Map _id to id for the frontend
    const mapped = schedules.map(s => ({
      id: s._id.toString(),
      title: s.title,
      type: s.type,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      location: s.location,
      customerName: s.customerName,
      customerNumber: s.customerNumber,
      assignedTo: s.assignedTo,
      notes: s.notes
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
});

// Create a schedule
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const mockEntry = { ...req.body, id: new mongoose.Types.ObjectId().toString() };
      mockSchedules.push(mockEntry);
      return res.status(201).json(mockEntry);
    }
    
    const newSchedule = new Schedule(req.body);
    const saved = await newSchedule.save();
    
    res.status(201).json({
      id: saved._id.toString(),
      title: saved.title,
      type: saved.type,
      date: saved.date,
      startTime: saved.startTime,
      endTime: saved.endTime,
      location: saved.location,
      customerName: saved.customerName,
      customerNumber: saved.customerNumber,
      assignedTo: saved.assignedTo,
      notes: saved.notes
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating schedule', error: error.message });
  }
});

// Update a schedule
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (!isDbConnected()) {
      const idx = mockSchedules.findIndex(s => s.id === req.params.id);
      if (idx !== -1) {
        mockSchedules[idx] = { ...mockSchedules[idx], ...req.body, id: req.params.id };
        return res.json(mockSchedules[idx]);
      }
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Schedule not found' });
    
    res.json({
      id: updated._id.toString(),
      title: updated.title,
      type: updated.type,
      date: updated.date,
      startTime: updated.startTime,
      endTime: updated.endTime,
      location: updated.location,
      customerName: updated.customerName,
      customerNumber: updated.customerNumber,
      assignedTo: updated.assignedTo,
      notes: updated.notes
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating schedule', error: error.message });
  }
});

// Delete a schedule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!isDbConnected()) {
      mockSchedules = mockSchedules.filter(s => s.id !== req.params.id);
      return res.json({ message: 'Deleted (mock)' });
    }
    
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Schedule not found' });
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
});

export default router;
