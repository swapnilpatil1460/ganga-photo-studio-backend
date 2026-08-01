"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleValidators = exports.orderValidators = exports.employeeValidators = exports.customerValidators = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
// Middleware to check validation results
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
// Customer Validations
exports.customerValidators = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required').trim(),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required').trim(),
    (0, express_validator_1.body)('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
    (0, express_validator_1.body)('address').optional().trim(),
    (0, express_validator_1.body)('notes').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['ACTIVE', 'INACTIVE', 'VIP']).withMessage('Invalid status')
];
// Employee Validations
exports.employeeValidators = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required').trim(),
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required').normalizeEmail(),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required').trim(),
    (0, express_validator_1.body)('role').notEmpty().withMessage('Role is required').isIn(['Owner', 'Manager', 'Editor', 'Printer Operator', 'Photographer', 'Receptionist', 'Helper']).withMessage('Invalid role'),
    (0, express_validator_1.body)('status').optional().isIn(['Active', 'On Leave', 'Former']).withMessage('Invalid status'),
    (0, express_validator_1.body)('salary').optional().isNumeric().withMessage('Salary must be a number')
];
// Order Validations
exports.orderValidators = [
    (0, express_validator_1.body)('customer').notEmpty().withMessage('Customer ID is required').trim(),
    (0, express_validator_1.body)('service').notEmpty().withMessage('Service type is required').trim(),
    (0, express_validator_1.body)('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Price must be a number'),
    (0, express_validator_1.body)('totalAmount').notEmpty().withMessage('Total Amount is required').isNumeric(),
    (0, express_validator_1.body)('paidAmount').optional().isNumeric(),
    (0, express_validator_1.body)('expectedDeliveryDate').notEmpty().withMessage('Expected delivery date is required').isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('priority').optional().isIn(['Low', 'Normal', 'High', 'Urgent']).withMessage('Invalid priority'),
    (0, express_validator_1.body)('assignedEmployee').optional().trim()
];
// Schedule Validations
exports.scheduleValidators = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required').trim(),
    (0, express_validator_1.body)('type').notEmpty().withMessage('Type is required').trim(),
    (0, express_validator_1.body)('date').notEmpty().withMessage('Date is required').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format must be YYYY-MM-DD'),
    (0, express_validator_1.body)('startTime').notEmpty().withMessage('Start time is required').matches(/^\d{2}:\d{2}$/).withMessage('Format must be HH:MM'),
    (0, express_validator_1.body)('endTime').notEmpty().withMessage('End time is required').matches(/^\d{2}:\d{2}$/).withMessage('Format must be HH:MM'),
    (0, express_validator_1.body)('location').optional().trim(),
    (0, express_validator_1.body)('customerName').optional().trim(),
    (0, express_validator_1.body)('customerNumber').optional().trim(),
    (0, express_validator_1.body)('assignedTo').optional().trim(),
    (0, express_validator_1.body)('notes').optional().trim()
];
//# sourceMappingURL=validators.js.map