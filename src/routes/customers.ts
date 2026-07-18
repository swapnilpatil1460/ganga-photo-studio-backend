import express from 'express';
import mongoose from 'mongoose';
import { Customer } from '../models/Customer';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { mockUsers } from './users';

const router = express.Router();

let mockCustomers: any[] = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

export const updateMockCustomerStats = (id: string, amount: number) => {
  const index = mockCustomers.findIndex(c => c._id === id);
  if (index !== -1) {
    mockCustomers[index].totalOrders += 1;
    mockCustomers[index].totalSpent += amount;
  }
};

export const getMockCustomers = () => mockCustomers;

// GET /api/customers (Search & Pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { name, phone, email, dateFilter } = req.query;

    if (isDbConnected()) {
      let query: any = { deleted: false };
      
      if (name) query.name = { $regex: name, $options: 'i' };
      if (phone) query.phone = { $regex: phone, $options: 'i' };
      if (email) query.email = { $regex: email, $options: 'i' };
      
      if (dateFilter) {
        const now = new Date();
        if (dateFilter === 'last7days') {
          query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        } else if (dateFilter === 'last30days') {
          query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        } else if (dateFilter === 'thisYear') {
          query.createdAt = { $gte: new Date(new Date().getFullYear(), 0, 1) };
        } else if (typeof dateFilter === 'string' && dateFilter.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const startOfDay = new Date(dateFilter);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateFilter);
          endOfDay.setHours(23, 59, 59, 999);
          query.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }
      }

      const customers = await Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      const total = await Customer.countDocuments(query);

      res.json({
        data: customers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      let filtered = mockCustomers.filter(c => !c.deleted);
      if (name) filtered = filtered.filter(c => c.name.toLowerCase().includes((name as string).toLowerCase()));
      if (phone) filtered = filtered.filter(c => c.phone.includes(phone as string));
      if (email) filtered = filtered.filter(c => c.email && c.email.toLowerCase().includes((email as string).toLowerCase()));
      
      if (dateFilter) {
        const now = new Date();
        let targetDate: Date;
        if (dateFilter === 'last7days') {
          targetDate = new Date(now.setDate(now.getDate() - 7));
          filtered = filtered.filter(c => new Date(c.createdAt) >= targetDate);
        } else if (dateFilter === 'last30days') {
          targetDate = new Date(now.setDate(now.getDate() - 30));
          filtered = filtered.filter(c => new Date(c.createdAt) >= targetDate);
        } else if (dateFilter === 'thisYear') {
          targetDate = new Date(new Date().getFullYear(), 0, 1);
          filtered = filtered.filter(c => new Date(c.createdAt) >= targetDate);
        } else if (typeof dateFilter === 'string' && dateFilter.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const startOfDay = new Date(dateFilter);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateFilter);
          endOfDay.setHours(23, 59, 59, 999);
          filtered = filtered.filter(c => {
            const d = new Date(c.createdAt);
            return d >= startOfDay && d <= endOfDay;
          });
        }
      }

      const paginated = filtered.slice(skip, skip + limit);
      res.json({
        data: paginated,
        pagination: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit)
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

// GET Single Customer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const customer = await Customer.findOne({ _id: req.params.id, deleted: false });
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      res.json(customer);
    } else {
      const customer = mockCustomers.find(c => c._id === req.params.id && !c.deleted);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      res.json(customer);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer' });
  }
});

// POST new customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const generatePassword = (name: string) => {
      const firstName = (name.split(' ')[0] || 'User').replace(/[^a-zA-Z]/g, '');
      const baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      
      const numbers = "0123456789";
      const symbols = "!@#$%^&*";
      
      let suffix = "";
      for (let i = 0; i < 3; i++) suffix += numbers[Math.floor(Math.random() * 10)];
      suffix += symbols[Math.floor(Math.random() * symbols.length)];
      
      let password = baseName + suffix;
      while (password.length < 8) password += numbers[Math.floor(Math.random() * 10)];
      
      return password;
    };

    if (isDbConnected()) {
      // Check duplicate phone
      const existing = await Customer.findOne({ phone: req.body.phone, deleted: false });
      if (existing) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
      
      const customer = new Customer(req.body);
      const saved = await customer.save();
      
      let generatedPassword = null;
      if (saved.email) {
        generatedPassword = generatePassword(saved.name);
        try {
          const user = new User({
            email: saved.email,
            password: generatedPassword,
            role: 'customer'
          });
          await user.save();
        } catch (err) {
          console.error("Error creating user for customer:", err);
          generatedPassword = null; // Do not return credentials if user creation failed
        }
      }

      res.status(201).json({ customer: saved, credentials: generatedPassword ? { email: saved.email, password: generatedPassword } : null });
    } else {
      if (mockCustomers.some(c => c.phone === req.body.phone && !c.deleted)) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
      
      const lastCode = mockCustomers.length > 0 
        ? parseInt(mockCustomers[0].customerId.split('-')[1]) 
        : 1000;
        
      const newCust = { 
        _id: Date.now().toString(), 
        ...req.body, 
        customerId: `CUS-${lastCode + 1}`,
        totalOrders: 0,
        totalSpent: 0,
        deleted: false,
        createdAt: new Date()
      };
      mockCustomers.unshift(newCust);
      
      let generatedPassword = null;
      if (newCust.email) {
        generatedPassword = generatePassword(newCust.name);
        mockUsers.push({
          _id: `usr_${Date.now()}`,
          email: newCust.email,
          password: generatedPassword,
          role: 'customer'
        });
      }

      res.status(201).json({ customer: newCust, credentials: generatedPassword ? { email: newCust.email, password: generatedPassword } : null });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error creating customer', error });
  }
});

// PUT update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      // Check duplicate phone if phone is being updated
      if (req.body.phone) {
        const existing = await Customer.findOne({ phone: req.body.phone, _id: { $ne: req.params.id }, deleted: false });
        if (existing) {
          return res.status(400).json({ message: 'Phone number already exists' });
        }
      }

      const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Customer not found' });
      res.json(updated);
    } else {
      const index = mockCustomers.findIndex(c => c._id === req.params.id && !c.deleted);
      if (index === -1) return res.status(404).json({ message: 'Customer not found' });
      
      if (req.body.phone && mockCustomers.some(c => c.phone === req.body.phone && c._id !== req.params.id && !c.deleted)) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }

      mockCustomers[index] = { ...mockCustomers[index], ...req.body };
      res.json(mockCustomers[index]);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating customer', error });
  }
});

// DELETE (soft delete) customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const deleted = await Customer.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
      if (!deleted) return res.status(404).json({ message: 'Customer not found' });
      res.json({ message: 'Customer deleted successfully' });
    } else {
      const index = mockCustomers.findIndex(c => c._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Customer not found' });
      mockCustomers[index].deleted = true;
      res.json({ message: 'Customer deleted successfully' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error deleting customer', error });
  }
});

export default router;
