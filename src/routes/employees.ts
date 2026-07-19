import express from 'express';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { Order } from '../models/Order';
import { EmployeeActivity } from '../models/EmployeeActivity';

const router = express.Router();

// GET all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// POST new employee
router.post('/', authenticateToken, async (req, res) => {
  try {
    const empData = req.body;
    
    const generatePassword = (name: string) => {
      const firstName = (name.split(' ')[0] || 'User').replace(/[^a-zA-Z]/g, '');
      const baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      
      const numbers = "0123456789";
      const symbols = "!@#$%^&*";
      
      let suffix = "";
      // Add 3 random numbers and 1 symbol
      for (let i = 0; i < 3; i++) suffix += numbers[Math.floor(Math.random() * 10)];
      suffix += symbols[Math.floor(Math.random() * symbols.length)];
      
      let password = baseName + suffix;
      
      // Ensure at least 8 characters
      while (password.length < 8) {
        password += numbers[Math.floor(Math.random() * 10)];
      }
      
      return password;
    };
    const generatedPassword = generatePassword(empData.name || '');

    const employee = new Employee(empData);
    const savedEmployee = await employee.save();
    
    // Create User account for the employee
    const user = new User({
      email: savedEmployee.email,
      password: generatedPassword,
      role: 'employee'
    });
    await user.save();

    res.status(201).json({ employee: savedEmployee, credentials: { email: savedEmployee.email, password: generatedPassword } });
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating employee', error: error.message || 'Unknown error' });
  }
});

// PUT update employee (full update)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const empData = req.body;
    const employee = await Employee.findByIdAndUpdate(req.params.id, empData, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating employee', error: error.message || 'Unknown error' });
  }
});

// PUT update employee status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating employee', error });
  }
});

// GET single employee details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// GET employee activities
router.get('/:id/activities', authenticateToken, async (req, res) => {
  try {
    const activities = await EmployeeActivity.find({ employeeId: req.params.id }).sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// GET employee dashboard metrics
router.get('/:id/dashboard', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const assignedToday = await Order.countDocuments({
      assignedEmployee: employee.name,
      createdAt: { $gte: startOfDay }
    });

    const completedToday = await Order.countDocuments({
      assignedEmployee: employee.name,
      status: { $in: ['Ready', 'Delivered'] },
      updatedAt: { $gte: startOfDay }
    });

    const pendingOrders = await Order.countDocuments({
      assignedEmployee: employee.name,
      status: { $nin: ['Ready', 'Delivered', 'Cancelled'] }
    });

    // Calculate average completion time
    const completedOrdersList = await Order.find({
      assignedEmployee: employee.name,
      status: { $in: ['Ready', 'Delivered'] }
    });
    
    let averageCompletionTime = 0;
    if (completedOrdersList.length > 0) {
      let totalHours = 0;
      completedOrdersList.forEach((order: any) => {
        const created = new Date(order.createdAt).getTime();
        const updated = new Date(order.updatedAt).getTime();
        totalHours += (updated - created) / (1000 * 60 * 60);
      });
      averageCompletionTime = Math.round((totalHours / completedOrdersList.length) * 10) / 10;
    }

    return res.json({
      assignedToday,
      completedToday,
      pendingOrders,
      averageCompletionTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard metrics' });
  }
});

export default router;
