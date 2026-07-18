import express from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { authenticateToken } from '../middleware/auth';
import { updateMockCustomerStats, getMockCustomers } from './customers';
import { logEmployeeActivity, getMockEmployees } from './employees';
import { EmployeeActivity } from '../models/EmployeeActivity';

const router = express.Router();

export let mockOrders: any[] = [];
export const getMockOrders = () => mockOrders;
let nextOrderId = 2001;

const isDbConnected = () => mongoose.connection.readyState === 1;

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

    if (isDbConnected()) {
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
        monthlyRevenue[d._id - 1].value = d.total; // _id is 1-12
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
    } else {
      // Memory fallback
      const todaysOrders = mockOrders.filter(o => new Date(o.createdAt) >= today);
      const monthOrders = mockOrders.filter(o => new Date(o.createdAt) >= startOfMonth);
      
      // Calculate pending payments
      const pendingPayments = mockOrders.reduce((sum, o) => {
        const due = (o.totalAmount || 0) - (o.paidAmount || 0);
        return due > 0 ? sum + due : sum;
      }, 0);
      
      // Calculate active employees
      const mockEmps = getMockEmployees();
      const activeEmployees = mockEmps.filter(e => e.status === 'Active' || e.status === 'Active').length || mockEmps.length;

      // Populate mock charts with some realistic looking data if empty, or calculate from mockOrders
      if (mockOrders.length > 0) {
        mockOrders.forEach(o => {
          const createdAtDate = new Date(o.createdAt);
          const m = createdAtDate.getMonth();
          monthlyRevenue[m].value += o.totalAmount;
          
          const dateStr = createdAtDate.toISOString().split('T')[0];
          const dailyEntry = dailyRevenue.find(d => d.date === dateStr);
          if (dailyEntry) dailyEntry.value += o.totalAmount;
          
          const s = topServices.find(ts => ts.name === o.service);
          if (s) s.value += 1;
          else topServices.push({ name: o.service, value: 1 });
        });
      } else {
        // Dummy data for empty state to show off the charts
        monthlyRevenue = monthNames.map((m, i) => ({ month: m, value: Math.floor(Math.random() * 50000) + 10000 }));
        monthlyCustomers = monthNames.map(m => ({ month: m, new: Math.floor(Math.random() * 20) + 5, returning: Math.floor(Math.random() * 15) + 2 }));
        dailyRevenue = dailyRevenue.map(d => ({ ...d, value: Math.floor(Math.random() * 8000) + 2000 }));
        topServices = [
          { name: 'Wedding Photography', value: 25 },
          { name: 'Portrait Session', value: 15 },
          { name: 'Event Coverage', value: 10 },
          { name: 'Product Photography', value: 8 }
        ];
      }

      res.json({
        totalOrders: mockOrders.length,
        todaysOrders: todaysOrders.length,
        pendingOrders: mockOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length,
        completedOrders: mockOrders.filter(o => o.status === 'Delivered').length,
        revenueToday: todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        revenueThisMonth: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        pendingPayments,
        activeEmployees,
        monthlyRevenue,
        dailyRevenue: dailyRevenue.map(({day, value}) => ({ day, value })),
        monthlyCustomers,
        topServices
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// GET All Orders (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, employee, service, startDate, endDate, search } = req.query;
    
    if (isDbConnected()) {
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

      const orders = await Order.find(query).populate('customer').sort({ createdAt: -1 });
      res.json(orders);
    } else {
      let filtered = [...mockOrders];
      
      if (status) {
        if (status === 'Pending') {
          filtered = filtered.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
        } else {
          filtered = filtered.filter(o => o.status === status);
        }
      }
      if (employee) filtered = filtered.filter(o => o.assignedEmployee === employee);
      if (service) filtered = filtered.filter(o => o.service === service);
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        filtered = filtered.filter(o => new Date(o.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(o => new Date(o.createdAt) <= end);
      }
      if (search) filtered = filtered.filter(o => o.orderId.toLowerCase().includes((search as string).toLowerCase()));

      // Populate mock customers
      const allCustomers = getMockCustomers();
      const populated = filtered.map(o => ({
        ...o,
        customer: allCustomers.find(c => c._id === o.customer) || o.customer
      }));

      res.json(populated.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// GET Single Order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const order = await Order.findById(req.params.id).populate('customer');
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json(order);
    } else {
      const order = mockOrders.find(o => o._id === req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      
      const allCustomers = getMockCustomers();
      const populatedOrder = {
        ...order,
        customer: allCustomers.find(c => c._id === order.customer) || order.customer
      };
      
      res.json(populatedOrder);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// GET Orders for a specific customer
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const orders = await Order.find({ customer: req.params.customerId }).sort({ createdAt: -1 });
      res.json(orders);
    } else {
      const orders = mockOrders.filter(o => o.customer === req.params.customerId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// POST new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderData = req.body;
    
    if (isDbConnected()) {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      
      // Update customer stats
      await Customer.findByIdAndUpdate(orderData.customer, {
        $inc: { totalOrders: 1, totalSpent: orderData.totalAmount }
      });
      
      res.status(201).json(savedOrder);
    } else {
      const newOrder = {
        _id: Date.now().toString(),
        orderId: `ORD-${nextOrderId++}`,
        ...orderData,
        status: 'Received',
        timeline: [{ status: 'Received', timestamp: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockOrders.unshift(newOrder);
      
      // Update customer stats in memory
      updateMockCustomerStats(orderData.customer, orderData.totalAmount);
      
      res.status(201).json(newOrder);
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message ? `Error: ${error.message}` : 'Error creating order', error });
  }
});

// PUT update order status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, changedBy = 'Owner' } = req.body;
    if (isDbConnected()) {
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
    } else {
      const index = mockOrders.findIndex(o => o._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Order not found' });
      
      const prevStatus = mockOrders[index].status;
      mockOrders[index].status = status;
      mockOrders[index].timeline.push({ status, timestamp: new Date() });
      if (!mockOrders[index].activityLogs) mockOrders[index].activityLogs = [];
      mockOrders[index].activityLogs.push({
        changedBy,
        changedAt: new Date(),
        previousStatus: prevStatus,
        newStatus: status
      });
      
      // Log Activity (Mock mode)
      const mockEmps = getMockEmployees();
      const emp = mockEmps.find(e => e.name === changedBy);
      const empId = emp ? emp._id : 'emp1';
      logEmployeeActivity(empId, changedBy, 'Status Update', mockOrders[index].orderId, `Updated status from ${prevStatus} to ${status}`);
      
      res.json(mockOrders[index]);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error });
  }
});

// PUT assign employee
router.put('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { employee, changedBy = 'Owner' } = req.body;
    if (isDbConnected()) {
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
    } else {
      const index = mockOrders.findIndex(o => o._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Order not found' });
      
      mockOrders[index].assignedEmployee = employee;
      if (!mockOrders[index].activityLogs) mockOrders[index].activityLogs = [];
      mockOrders[index].activityLogs.push({
        changedBy,
        changedAt: new Date(),
        previousStatus: mockOrders[index].status,
        newStatus: mockOrders[index].status,
        notes: `Assigned to ${employee}`
      });
      
      // Log Activity (Mock mode)
      const mockEmps = getMockEmployees();
      const emp = mockEmps.find(e => e.name === changedBy);
      const empId = emp ? emp._id : 'emp1';
      logEmployeeActivity(empId, changedBy, 'Assigned', mockOrders[index].orderId, `Assigned order to ${employee}`);
      
      res.json(mockOrders[index]);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error assigning employee', error });
  }
});

// PUT update payment
router.put('/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { amount, changedBy = 'Owner' } = req.body;
    if (isDbConnected()) {
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
        actionType: 'Payment',
        orderId: saved.orderId,
        description: `Added payment of ₹${amount}`
      });
      
      res.json(saved);
    } else {
      const index = mockOrders.findIndex(o => o._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Order not found' });
      
      const prevPaid = mockOrders[index].paidAmount || 0;
      mockOrders[index].paidAmount = prevPaid + Number(amount);
      if (!mockOrders[index].activityLogs) mockOrders[index].activityLogs = [];
      mockOrders[index].activityLogs.push({
        changedBy,
        changedAt: new Date(),
        previousStatus: mockOrders[index].status,
        newStatus: mockOrders[index].status,
        notes: `Added payment of ₹${amount}`
      });
      
      // Log Activity (Mock mode)
      const mockEmps = getMockEmployees();
      const emp = mockEmps.find(e => e.name === changedBy);
      const empId = emp ? emp._id : 'emp1';
      logEmployeeActivity(empId, changedBy, 'Payment', mockOrders[index].orderId, `Added payment of ₹${amount}`);
      
      res.json(mockOrders[index]);
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating payment', error });
  }
});

export default router;
