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
        deductions, advanceRecovery, leaveDeduction, grossSalary, netSalary
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
          deductions, advanceRecovery, leaveDeduction, grossSalary, netSalary
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

// PUT pay salary (supports full or partial payments)
router.put('/:id/pay', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const { transactionReference, paymentDate, amountPaid } = req.body;
    const record = await SalaryRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    
    if (record.status !== 'Calculated' && record.status !== 'Partial') {
      return res.status(400).json({ message: 'Salary must be calculated or partially paid before payment' });
    }

    const netSalary = record.components?.netSalary || 0;
    const currentPaid = (record.paymentDetails as any)?.paidAmount || 0;
    const currentRemaining = Math.max(0, netSalary - currentPaid);

    let payAmount = Number(amountPaid);
    if (isNaN(payAmount) || payAmount <= 0) {
      payAmount = currentRemaining;
    }

    if (payAmount > currentRemaining && currentRemaining > 0) {
      return res.status(400).json({ 
        message: `Payment amount (₹${payAmount}) exceeds remaining balance of ₹${currentRemaining}` 
      });
    }

    const newPaidTotal = currentPaid + payAmount;
    const newRemaining = Math.max(0, netSalary - newPaidTotal);
    const isFullPayment = newRemaining === 0;

    record.status = isFullPayment ? 'Paid' : 'Partial';

    if (!record.paymentDetails) {
      record.paymentDetails = {
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        transactionReference: transactionReference || '',
        paidAmount: 0,
        remainingAmount: netSalary,
        history: []
      } as any;
    }

    (record.paymentDetails as any).paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    (record.paymentDetails as any).transactionReference = transactionReference || '';
    (record.paymentDetails as any).paidAmount = newPaidTotal;
    (record.paymentDetails as any).remainingAmount = newRemaining;

    if (!(record.paymentDetails as any).history) {
      (record.paymentDetails as any).history = [];
    }

    (record.paymentDetails as any).history.push({
      amount: payAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      transactionReference: transactionReference || '',
      createdAt: new Date()
    });

    await record.save();
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing salary payment', error: error.message });
  }
});


// GET export all salary data as CSV
router.get('/export/csv', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const records = await SalaryRecord.find().populate('employeeId', 'name role email').sort({ month: -1 });
    
    let csv = 'Month,Employee Name,Role,Email,Status,Working Days,Present,Paid Leave,Unpaid Leave,Absent,Basic Salary,Other Earnings,Gross Salary,Deductions,Advance Recovery,Leave Deduction,Net Salary,Paid Amount,Remaining Amount,Payment Date,Transaction Ref\n';
    
    records.forEach(r => {
      const emp = r.employeeId as any;
      if (!emp) return;
      
      const comp = r.components || {} as any;
      const att = r.attendance || {} as any;
      const pay = r.paymentDetails || {} as any;
      const net = comp.netSalary || 0;
      const paid = pay.paidAmount ?? (r.status === 'Paid' ? net : 0);
      const remaining = pay.remainingAmount ?? (r.status === 'Paid' ? 0 : net);
      
      const row = [
        r.month,
        `"${emp.name || ''}"`,
        `"${emp.role || ''}"`,
        emp.email || '',
        r.status,
        att.workingDays || 0,
        att.present || 0,
        att.paidLeave || 0,
        att.unpaidLeave || 0,
        att.absent || 0,
        comp.basicSalary || 0,
        comp.otherEarnings || 0,
        comp.grossSalary || 0,
        comp.deductions || 0,
        comp.advanceRecovery || 0,
        comp.leaveDeduction || 0,
        net,
        paid,
        remaining,
        pay.paymentDate ? new Date(pay.paymentDate).toISOString().split('T')[0] : '',
        pay.transactionReference || ''
      ];
      
      csv += row.join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=salary_history.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

export default router;
