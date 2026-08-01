import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to check validation results
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Customer Validations
export const customerValidators = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('phone').notEmpty().withMessage('Phone is required').trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('address').optional().trim(),
  body('notes').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'VIP']).withMessage('Invalid status')
];

// Employee Validations
export const employeeValidators = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone is required').trim(),
  body('role').notEmpty().withMessage('Role is required').isIn(['Owner', 'Manager', 'Editor', 'Printer Operator', 'Photographer', 'Receptionist', 'Helper']).withMessage('Invalid role'),
  body('status').optional().isIn(['Active', 'On Leave', 'Former']).withMessage('Invalid status'),
  body('salary').optional().isNumeric().withMessage('Salary must be a number')
];

// Order Validations
export const orderValidators = [
  body('customer').notEmpty().withMessage('Customer ID is required').trim(),
  body('service').notEmpty().withMessage('Service type is required').trim(),
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('totalAmount').notEmpty().withMessage('Total Amount is required').isNumeric(),
  body('paidAmount').optional().isNumeric(),
  body('expectedDeliveryDate').notEmpty().withMessage('Expected delivery date is required').isISO8601().withMessage('Invalid date format'),
  body('priority').optional().isIn(['Low', 'Normal', 'High', 'Urgent']).withMessage('Invalid priority'),
  body('assignedEmployee').optional().trim()
];

// Schedule Validations
export const scheduleValidators = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('type').notEmpty().withMessage('Type is required').trim(),
  body('date').notEmpty().withMessage('Date is required').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format must be YYYY-MM-DD'),
  body('startTime').notEmpty().withMessage('Start time is required').matches(/^\d{2}:\d{2}$/).withMessage('Format must be HH:MM'),
  body('endTime').notEmpty().withMessage('End time is required').matches(/^\d{2}:\d{2}$/).withMessage('Format must be HH:MM'),
  body('location').optional().trim(),
  body('customerName').optional().trim(),
  body('customerNumber').optional().trim(),
  body('assignedTo').optional().trim(),
  body('notes').optional().trim()
];
