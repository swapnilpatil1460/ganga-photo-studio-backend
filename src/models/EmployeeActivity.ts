import mongoose from 'mongoose';

const employeeActivitySchema = new mongoose.Schema({
  employeeId: { type: String, required: true }, // Using string to support mock IDs or ObjectId
  employeeName: { type: String, required: true },
  actionType: { 
    type: String, 
    enum: ['Status Update', 'Assigned', 'Comment', 'System'],
    required: true 
  },
  orderId: { type: String, required: true }, // The ORD-xxxx display ID
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  durationHours: { type: Number, default: 0 } // Captured if this action completed a phase
});

employeeActivitySchema.index({ employeeId: 1 });
employeeActivitySchema.index({ orderId: 1 });
employeeActivitySchema.index({ timestamp: -1 });

export const EmployeeActivity = mongoose.model('EmployeeActivity', employeeActivitySchema);
