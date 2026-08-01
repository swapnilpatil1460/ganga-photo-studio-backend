"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Employee_1 = require("../models/Employee");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const Order_1 = require("../models/Order");
const EmployeeActivity_1 = require("../models/EmployeeActivity");
const validators_1 = require("../middleware/validators");
const roles_1 = require("../middleware/roles");
const router = express_1.default.Router();
// GET all employees
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const employees = await Employee_1.Employee.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Employee_1.Employee.countDocuments();
        res.json({
            data: employees,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employees' });
    }
});
// POST new employee
router.post('/', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), validators_1.employeeValidators, validators_1.validateRequest, async (req, res) => {
    try {
        const empData = req.body;
        const generatePassword = (name) => {
            const firstName = (name.split(' ')[0] || 'User').replace(/[^a-zA-Z]/g, '');
            const baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            const numbers = "0123456789";
            const symbols = "!@#$%^&*";
            let suffix = "";
            // Add 3 random numbers and 1 symbol
            for (let i = 0; i < 3; i++)
                suffix += numbers[Math.floor(Math.random() * 10)];
            suffix += symbols[Math.floor(Math.random() * symbols.length)];
            let password = baseName + suffix;
            // Ensure at least 8 characters
            while (password.length < 8) {
                password += numbers[Math.floor(Math.random() * 10)];
            }
            return password;
        };
        const generatedPassword = generatePassword(empData.name || '');
        const employee = new Employee_1.Employee(empData);
        const savedEmployee = await employee.save();
        // Create User account for the employee
        const user = new User_1.User({
            email: savedEmployee.email,
            password: generatedPassword,
            role: 'employee'
        });
        await user.save();
        res.status(201).json({ employee: savedEmployee, credentials: { email: savedEmployee.email, password: generatedPassword } });
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating employee', error: error.message || 'Unknown error' });
    }
});
// PUT update employee (full update)
router.put('/:id', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), validators_1.employeeValidators, validators_1.validateRequest, async (req, res) => {
    try {
        const empData = req.body;
        const employee = await Employee_1.Employee.findByIdAndUpdate(req.params.id, empData, { new: true, runValidators: true });
        if (!employee)
            return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating employee', error: error.message || 'Unknown error' });
    }
});
// PUT update employee status
router.put('/:id/status', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), async (req, res) => {
    try {
        const { status } = req.body;
        const employee = await Employee_1.Employee.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!employee)
            return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating employee', error });
    }
});
// GET single employee details
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findById(req.params.id);
        if (!employee)
            return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employee' });
    }
});
// GET employee activities
router.get('/:id/activities', auth_1.authenticateToken, async (req, res) => {
    try {
        const activities = await EmployeeActivity_1.EmployeeActivity.find({ employeeId: req.params.id }).sort({ timestamp: -1 });
        res.json(activities);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching activities' });
    }
});
// GET employee dashboard metrics
router.get('/:id/dashboard', auth_1.authenticateToken, async (req, res) => {
    try {
        const employeeId = req.params.id;
        const employee = await Employee_1.Employee.findById(employeeId);
        if (!employee)
            return res.status(404).json({ message: 'Employee not found' });
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const assignedToday = await Order_1.Order.countDocuments({
            assignedEmployee: employee.name,
            createdAt: { $gte: startOfDay }
        });
        const completedToday = await Order_1.Order.countDocuments({
            assignedEmployee: employee.name,
            status: { $in: ['Ready', 'Delivered'] },
            updatedAt: { $gte: startOfDay }
        });
        const pendingOrders = await Order_1.Order.countDocuments({
            assignedEmployee: employee.name,
            status: { $nin: ['Ready', 'Delivered', 'Cancelled'] }
        });
        // Calculate average completion time
        const completedOrdersList = await Order_1.Order.find({
            assignedEmployee: employee.name,
            status: { $in: ['Ready', 'Delivered'] }
        });
        let averageCompletionTime = 0;
        if (completedOrdersList.length > 0) {
            let totalHours = 0;
            completedOrdersList.forEach((order) => {
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard metrics' });
    }
});
// POST reset employee password
router.post('/:id/reset-password', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findById(req.params.id);
        if (!employee)
            return res.status(404).json({ message: 'Employee not found' });
        const generatePassword = (name) => {
            const firstName = (name.split(' ')[0] || 'User').replace(/[^a-zA-Z]/g, '');
            const baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            const numbers = "0123456789";
            const symbols = "!@#$%^&*";
            let suffix = "";
            for (let i = 0; i < 3; i++)
                suffix += numbers[Math.floor(Math.random() * 10)];
            suffix += symbols[Math.floor(Math.random() * symbols.length)];
            let password = baseName + suffix;
            while (password.length < 8) {
                password += numbers[Math.floor(Math.random() * 10)];
            }
            return password;
        };
        const newPassword = generatePassword(employee.name);
        // Update the User document for this employee
        const user = await User_1.User.findOne({ email: employee.email });
        if (!user) {
            // If user doesn't exist for some reason, create it
            const newUser = new User_1.User({
                email: employee.email,
                password: newPassword,
                role: employee.role === 'Owner' ? 'owner' : 'employee'
            });
            await newUser.save();
        }
        else {
            user.password = newPassword;
            await user.save(); // User schema has a pre-save hook that hashes the password
        }
        // Log the activity
        await EmployeeActivity_1.EmployeeActivity.create({
            employeeId: req.user?.userId || 'System',
            employeeName: 'Owner',
            actionType: 'System',
            orderId: 'SYS-AUTH',
            description: `Reset password for employee ${employee.name}`
        });
        res.json({ message: 'Password reset successfully', credentials: { email: employee.email, password: newPassword } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message || 'Unknown error' });
    }
});
// GET password for employee (Owner only)
router.get('/:id/password', auth_1.authenticateToken, (0, roles_1.requireRole)(['owner']), async (req, res) => {
    try {
        const employee = await Employee_1.Employee.findById(req.params.id);
        if (!employee)
            return res.status(404).json({ message: 'Employee not found' });
        const user = await User_1.User.findOne({ email: employee.email });
        if (!user)
            return res.status(404).json({ message: 'User record not found' });
        if (!user.encryptedPassword)
            return res.status(400).json({ message: 'Password is encrypted with older one-way hash. Please reset the password once to enable viewing.' });
        const decrypted = require('../utils/crypto').decrypt(user.encryptedPassword);
        res.json({ credentials: { email: user.email, password: decrypted } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving password', error: error.message || 'Unknown error' });
    }
});
exports.default = router;
//# sourceMappingURL=employees.js.map