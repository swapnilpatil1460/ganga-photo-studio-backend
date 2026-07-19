import express from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { authenticateToken } from '../middleware/auth';
import { EmployeeActivity } from '../models/EmployeeActivity';

const router = express.Router();

// GET Order Analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Initialize default chart data structures
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyRevenue = monthNames.map(m => ({ month: m, value: 0 }));
    let monthlyCustomers = monthNames.map(m => ({ month: m, new: 0, returning: 0 }));
    
    // Initialize 7 days for Daily Revenue
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let dailyRevenue = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { day: dayNames[d.getDay()], date: d.toISOString().split('T')[0], value: 0 };
    });

    let topServices = [
      { name: 'Wedding Photography', value: 0 },
      { name: 'Portrait Session', value: 0 },
      { name: 'Event Coverage', value: 0 },
      { name: 'Product Photography', value: 0 }
    ];

    // Basic Stats
    const [total, todayCount, pending, completed, revToday, revMonth, pendingPaymentsResult, Employee] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: { $ne: 'Delivered' } }),
      Order.countDocuments({ status: 'Delivered' }),
      Order.aggregate([{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([
        { $project: { due: { $subtract: ['$totalAmount', { $ifNull: ['$paidAmount', 0] }] } } },
        { $match: { due: { $gt: 0 } } },
        { $group: { _id: null, totalDue: { $sum: '$due' } } }
      ]),
      mongoose.model('Employee').countDocuments({ status: 'Active' }) // Assuming Employee has status Active
    ]);

    // Service Breakdown
    const serviceStats = await Order.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    topServices = serviceStats.map(s => ({ name: s._id || 'Other', value: s.count }));

    // Daily Revenue Aggregation (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);
    
    const dailyRevData = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" }
      }}
    ]);
    dailyRevData.forEach(d => {
      const entry = dailyRevenue.find(dr => dr.date === d._id);
      if (entry) entry.value = d.total;
    });

    // Monthly Revenue Aggregation (current year)
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const monthlyRevData = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" }
      }}
    ]);
    monthlyRevData.forEach(d => {
      if (d._id && d._id >= 1 && d._id <= 12) {
        monthlyRevenue[d._id - 1].value = d.total; // _id is 1-12
      }
    });

    res.json({
      totalOrders: total,
      todaysOrders: todayCount,
      pendingOrders: pending,
      completedOrders: completed,
      revenueToday: revToday[0]?.total || 0,
      revenueThisMonth: revMonth[0]?.total || 0,
      pendingPayments: pendingPaymentsResult[0]?.totalDue || 0,
      activeEmployees: Employee || 0,
      monthlyRevenue, 
      dailyRevenue: dailyRevenue.map(({day, value}) => ({ day, value })),
      monthlyCustomers, // Still placeholder, needs Customer model
      topServices
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// GET All Orders (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, employee, service, startDate, endDate, search } = req.query;
    
    let query: any = {};
    
    if (status) {
      if (status === 'Pending') {
        query.status = { $nin: ['Delivered', 'Cancelled'] };
      } else {
        query.status = status;
      }
    }
    if (employee) query.assignedEmployee = employee;
    if (service) query.service = service;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } }
      ];
      // Populate customer to search by customer name is tricky, so we'll just search orderId
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('customer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Order.countDocuments(query);

    res.json({
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// GET Single Order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// GET Orders for a specific customer
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.customerId as any }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// POST new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderData = req.body;
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    // Update customer stats
    await Customer.findByIdAndUpdate(orderData.customer, {
      $inc: { totalOrders: 1, totalSpent: orderData.totalAmount }
    });
    
    res.status(201).json(savedOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message ? `Error: ${error.message}` : 'Error creating order', error });
  }
});

// PUT update order status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, changedBy = 'Owner' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const prevStatus = order.status;
    order.status = status;
    order.timeline.push({ status, timestamp: new Date() });
    order.activityLogs.push({
      changedBy,
      changedAt: new Date(),
      previousStatus: prevStatus,
      newStatus: status
    });
    const saved = await order.save();
    
    // Log Activity (DB mode)
    await EmployeeActivity.create({
      employeeId: changedBy, // Should be actual ID from token
      employeeName: changedBy, 
      actionType: 'Status Update',
      orderId: saved.orderId,
      description: `Updated status from ${prevStatus} to ${status}`
    });
    
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error });
  }
});

// PUT assign employee
router.put('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { employee, changedBy = 'Owner' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.assignedEmployee = employee;
    order.activityLogs.push({
      changedBy,
      changedAt: new Date(),
      previousStatus: order.status,
      newStatus: order.status,
      notes: `Assigned to ${employee}`
    });
    const saved = await order.save();
    
    // Log Activity
    await EmployeeActivity.create({
      employeeId: changedBy, 
      employeeName: changedBy, 
      actionType: 'Assigned',
      orderId: saved.orderId,
      description: `Assigned order to ${employee}`
    });
    
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning employee', error });
  }
});

// PUT update payment
router.put('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { amount, changedBy = 'Owner' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const prevPaid = order.paidAmount || 0;
    order.paidAmount = prevPaid + Number(amount);
    if (!order.activityLogs) order.activityLogs = [];
    order.activityLogs.push({
      changedBy,
      changedAt: new Date(),
      previousStatus: order.status,
      newStatus: order.status,
      notes: `Added payment of ₹${amount}`
    });
    const saved = await order.save();
    
    // Log Activity
    await EmployeeActivity.create({
      employeeId: changedBy, 
      employeeName: changedBy, 
      actionType: 'System', // Changed from 'Payment' to fit enum
      orderId: saved.orderId,
      description: `Added payment of ₹${amount}`
    });
    
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error updating payment', error });
  }
});

export default router;
