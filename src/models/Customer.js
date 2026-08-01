"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customerSchema = new mongoose_1.default.Schema({
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
customerSchema.index({ createdAt: -1 });
customerSchema.index({ deleted: 1 });
// Pre-save hook to generate customerId
customerSchema.pre('save', async function () {
    if (this.isNew) {
        const lastCustomer = await mongoose_1.default.model('Customer').findOne().sort({ createdAt: -1 });
        if (lastCustomer && lastCustomer.customerId) {
            // Assuming format CUS-1001
            const parts = lastCustomer.customerId.split('-');
            let lastNumber = 1000;
            if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
                lastNumber = parseInt(parts[1]);
            }
            this.customerId = `CUS-${lastNumber + 1}`;
        }
        else {
            this.customerId = 'CUS-1001';
        }
    }
});
exports.Customer = mongoose_1.default.model('Customer', customerSchema);
//# sourceMappingURL=Customer.js.map