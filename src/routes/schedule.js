"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Schedule_1 = require("../models/Schedule");
const auth_1 = require("../middleware/auth");
const validators_1 = require("../middleware/validators");
const router = express_1.default.Router();
// Get all schedules
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const schedules = await Schedule_1.Schedule.find({})
            .sort({ date: 1, startTime: 1 })
            .skip(skip)
            .limit(limit);
        const total = await Schedule_1.Schedule.countDocuments();
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
        res.json({
            data: mapped,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching schedules', error: error.message });
    }
});
// Create a schedule
router.post('/', auth_1.authenticateToken, validators_1.scheduleValidators, validators_1.validateRequest, async (req, res) => {
    try {
        const newSchedule = new Schedule_1.Schedule(req.body);
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
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating schedule', error: error.message });
    }
});
// Update a schedule
router.put('/:id', auth_1.authenticateToken, validators_1.scheduleValidators, validators_1.validateRequest, async (req, res) => {
    try {
        const updated = await Schedule_1.Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Schedule not found' });
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
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating schedule', error: error.message });
    }
});
// Delete a schedule
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const deleted = await Schedule_1.Schedule.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Schedule not found' });
        res.json({ message: 'Schedule deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting schedule', error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=schedule.js.map