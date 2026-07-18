import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true },
  address: { type: String, trim: true },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'VIP'], default: 'ACTIVE' },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false } // Soft delete
}, { timestamps: true });

// Pre-save hook to generate customerId
customerSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const lastCustomer = await mongoose.model('Customer').findOne().sort({ createdAt: -1 });
      if (lastCustomer && lastCustomer.customerId) {
        // Assuming format CUS-1001
        const parts = lastCustomer.customerId.split('-');
        let lastNumber = 1000;
        if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
          lastNumber = parseInt(parts[1]);
        }
        this.customerId = `CUS-${lastNumber + 1}`;
      } else {
        this.customerId = 'CUS-1001';
      }
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

export const Customer = mongoose.model('Customer', customerSchema);
