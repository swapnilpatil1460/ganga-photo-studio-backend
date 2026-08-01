"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeActivity = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employeeActivitySchema = new mongoose_1.default.Schema({
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
exports.EmployeeActivity = mongoose_1.default.model('EmployeeActivity', employeeActivitySchema);
//# sourceMappingURL=EmployeeActivity.js.map