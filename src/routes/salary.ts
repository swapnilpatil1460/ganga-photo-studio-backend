import express from 'express';
import { SalaryRecord } from '../models/SalaryRecord';
import { Employee } from '../models/Employee';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = express.Router();

// GET all salary records for a specific month
router.get('/', authenticateToken, requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const month = req.query.month as string;
    if (!month) return res.status(400).json({ message: 'Month parameter (YYYY-MM) is required' });

    // Ensure we return a record for EVERY employee for that month, even if Draft
    const employees = await Employee.find({ status: { $ne: 'Former' } });
    const records = await SalaryRecord.find({ month }).populate('employeeId', 'name role email');

    // If an employee doesn't have a record for this month, create a draft in memory
    const result = employees.map(emp => {
      const existing = records.find(r => r.employeeId?._id.toString() === emp._id.toString());
      if (existing) return existing;
      
      return {
        _id: 'draft_' + emp._id,
        employeeId: { _id: emp._id, name: emp.name, role: emp.role, email: emp.email },
        month,
        status: 'Draft',
        components: {
          basicSalary: emp.salaryStructure?.basicSalary || 0,
          allowances: emp.salaryStructure?.allowances || 0,
          overtime: 0, incentive: 0, otherEarnings: 0, deductions: 0, advanceRecovery: 0,
          grossSalary: 0, netSalary: 0
        },
        attendance: { workingDays: 0, present: 0, paidLeave: 0, unpaidLeave: 0, absent: 0 }
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching salary records', error: error.message });
  }
});

// GET employee salary history
router.get('/employee/:id', authenticateToken, requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const records = await SalaryRecord.find({ employeeId: req.params.id })
      .sort({ month: -1 });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching employee salary history', error: error.message });
  }
});

// POST calculate/update salary
router.post('/calculate', authenticateToken, requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const { employeeId, month, attendance, components } = req.body;
    if (!employeeId || !month) return res.status(400).json({ message: 'Employee ID and Month are required' });

    let record = await SalaryRecord.findOne({ employeeId, month });
    if (record && record.status === 'Paid') {
      return res.status(400).json({ message: 'Cannot modify a paid salary record' });
    }

    const basicSalary = Number(components.basicSalary) || 0;
    const allowances = Number(components.allowances) || 0;
    const overtime = Number(components.overtime) || 0;
    const incentive = Number(components.incentive) || 0;
    const otherEarnings = Number(components.otherEarnings) || 0;
    const deductions = Number(components.deductions) || 0;
    const advanceRecovery = Number(components.advanceRecovery) || 0;
    const leaveDeduction = Number(components.leaveDeduction) || 0;

    const grossSalary = basicSalary + allowances + overtime + incentive + otherEarnings;
    const netSalary = grossSalary - deductions - advanceRecovery - leaveDeduction;

    if (record) {
      record.attendance = attendance;
      record.components = {
        basicSalary, allowances, overtime, incentive, otherEarnings,
        deductions, advanceRecovery, grossSalary, netSalary
      };
      record.status = 'Calculated';
      await record.save();
    } else {
      record = new SalaryRecord({
        employeeId,
        month,
        attendance,
        components: {
          basicSalary, allowances, overtime, incentive, otherEarnings,
          deductions, advanceRecovery, grossSalary, netSalary
        },
        status: 'Calculated'
      });
      await record.save();
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ message: 'Error calculating salary', error: error.message });
  }
});

// PUT pay salary
router.put('/:id/pay', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const { transactionReference, paymentDate } = req.body;
    const record = await SalaryRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    
    if (record.status !== 'Calculated') {
      return res.status(400).json({ message: 'Salary must be calculated before payment' });
    }

    record.status = 'Paid';
    record.paymentDetails = {
      paymentDate: paymentDate || new Date(),
      transactionReference: transactionReference || ''
    };

    await record.save();
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing salary payment', error: error.message });
  }
});

export default router;
