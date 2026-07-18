import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Owner', 'Manager', 'Editor', 'Printer Operator', 'Photographer', 'Receptionist'], 
    required: true 
  },
  photo: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'On Leave', 'Former'], 
    default: 'Active' 
  },
  dateJoined: { type: Date, default: Date.now },
  salary: { type: Number },
  totalOrdersHandled: { type: Number, default: 0 },
  averageCompletionTime: { type: Number, default: 0 } // in hours
}, { timestamps: true });

export const Employee = mongoose.model('Employee', employeeSchema);
