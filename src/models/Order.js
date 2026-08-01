"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    orderId: { type: String, unique: true },
    customer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Customer', required: true },
    service: { type: String, required: true }, // Keeping simple as string for now, could ref Service
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    assignedEmployee: { type: String, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High', 'Urgent'],
        default: 'Normal'
    },
    status: {
        type: String,
        enum: ['Received', 'Assigned', 'Editing', 'Printing', 'Ready', 'Delivered', 'Cancelled'],
        default: 'Received'
    },
    timeline: [{
            status: { type: String },
            timestamp: { type: Date, default: Date.now },
            notes: { type: String }
        }],
    activityLogs: [{
            changedBy: { type: String }, // e.g., 'Owner' or Employee Name
            changedAt: { type: Date, default: Date.now },
            previousStatus: { type: String },
            newStatus: { type: String },
            notes: { type: String }
        }]
}, { timestamps: true });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ assignedEmployee: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customer: 1 });
// Pre-save hook to generate orderId
orderSchema.pre('save', async function () {
    if (this.isNew) {
        const lastOrder = await mongoose_1.default.model('Order').findOne().sort({ createdAt: -1 });
        if (lastOrder && lastOrder.orderId) {
            const parts = lastOrder.orderId.split('-');
            let lastNumber = 2000;
            if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
                lastNumber = parseInt(parts[1]);
            }
            this.orderId = `ORD-${lastNumber + 1}`;
        }
        else {
            this.orderId = 'ORD-2001';
        }
        // Initialize timeline if empty
        if (this.timeline.length === 0) {
            this.timeline.push({ status: 'Received', timestamp: new Date() });
        }
    }
});
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map