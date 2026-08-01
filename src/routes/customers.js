"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Customer_1 = require("../models/Customer");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validators_1 = require("../middleware/validators");
const router = express_1.default.Router();
// GET /api/customers (Search & Pagination)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { name, phone, email, dateFilter } = req.query;
        let query = { deleted: false };
        if (name)
            query.name = { $regex: name, $options: 'i' };
        if (phone)
            query.phone = { $regex: phone, $options: 'i' };
        if (email)
            query.email = { $regex: email, $options: 'i' };
        if (dateFilter) {
            const now = new Date();
            if (dateFilter === 'last7days') {
                query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
            }
            else if (dateFilter === 'last30days') {
                query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 30)) };
            }
            else if (dateFilter === 'thisYear') {
                query.createdAt = { $gte: new Date(new Date().getFullYear(), 0, 1) };
            }
            else if (typeof dateFilter === 'string' && dateFilter.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const startOfDay = new Date(dateFilter);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(dateFilter);
                endOfDay.setHours(23, 59, 59, 999);
                query.createdAt = { $gte: startOfDay, $lte: endOfDay };
            }
        }
        const customers = await Customer_1.Customer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Customer_1.Customer.countDocuments(query);
        res.json({
            data: customers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customers' });
    }
});
// GET Single Customer
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findOne({ _id: req.params.id, deleted: false });
        if (!customer)
            return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching customer' });
    }
});
// POST new customer
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required').escape(),
    (0, express_validator_1.body)('phone').trim().isNumeric().withMessage('Phone must contain only numbers').isLength({ min: 10, max: 15 }).withMessage('Invalid phone length'),
    (0, express_validator_1.body)('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format').normalizeEmail()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }
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
            while (password.length < 8)
                password += numbers[Math.floor(Math.random() * 10)];
            return password;
        };
        // Check duplicate phone
        const existing = await Customer_1.Customer.findOne({ phone: req.body.phone, deleted: false });
        if (existing) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }
        const customer = new Customer_1.Customer(req.body);
        const saved = await customer.save();
        let generatedPassword = null;
        if (saved.email) {
            generatedPassword = generatePassword(saved.name);
            try {
                const user = new User_1.User({
                    email: saved.email,
                    password: generatedPassword,
                    role: 'customer'
                });
                await user.save(); // Will trigger bcrypt hashing hook
            }
            catch (err) {
                console.error("Error creating user for customer:", err);
                generatedPassword = null;
            }
        }
        res.status(201).json({ customer: saved, credentials: generatedPassword ? { email: saved.email, password: generatedPassword } : null });
    }
    catch (error) {
        res.status(400).json({ message: error.message ? `Error: ${error.message}` : 'Error creating customer', error });
    }
});
// PUT update customer
router.put('/:id', auth_1.authenticateToken, validators_1.customerValidators, validators_1.validateRequest, async (req, res) => {
    try {
        // Check duplicate phone if phone is being updated
        if (req.body.phone) {
            const existing = await Customer_1.Customer.findOne({ phone: req.body.phone, _id: { $ne: req.params.id }, deleted: false });
            if (existing) {
                return res.status(400).json({ message: 'Phone number already exists' });
            }
        }
        const updated = await Customer_1.Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Customer not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating customer', error });
    }
});
// DELETE (soft delete) customer
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findById(req.params.id);
        if (!customer)
            return res.status(404).json({ message: 'Customer not found' });
        customer.deleted = true;
        customer.phone = `${customer.phone}_deleted_${Date.now()}`;
        if (customer.email)
            customer.email = `${customer.email}_deleted_${Date.now()}`;
        await customer.save();
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Error deleting customer', error });
    }
});
exports.default = router;
//# sourceMappingURL=customers.js.map