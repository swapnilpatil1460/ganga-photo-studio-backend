import mongoose from 'mongoose';

const salaryRecordSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  
  components: {
    basicSalary: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    otherEarnings: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    advanceRecovery: { type: Number, default: 0 },
    leaveDeduction: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 }
  },

  attendance: {
    workingDays: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    paidLeave: { type: Number, default: 0 },
    unpaidLeave: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    leaveMap: { type: mongoose.Schema.Types.Mixed }
  },

  status: { 
    type: String, 
    enum: ['Draft', 'Calculated', 'Paid', 'Partial'], 
    default: 'Draft' 
  },
  
  paymentDetails: {
    paymentDate: { type: Date },
    transactionReference: { type: String },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    history: [{
      amount: { type: Number, required: true },
      paymentDate: { type: Date, default: Date.now },
      transactionReference: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true });

// Ensure an employee only has one record per month
salaryRecordSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export const SalaryRecord = mongoose.model('SalaryRecord', salaryRecordSchema);
