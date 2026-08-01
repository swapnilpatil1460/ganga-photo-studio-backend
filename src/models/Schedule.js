"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const scheduleSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // 'wedding', 'pre_wedding', etc.
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:MM
    endTime: { type: String, required: true }, // HH:MM
    location: { type: String },
    customerName: { type: String },
    customerNumber: { type: String },
    assignedTo: { type: String }, // Stored as comma-separated string for simplicity
    notes: { type: String },
    orderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });
scheduleSchema.index({ date: 1, startTime: 1 });
exports.Schedule = mongoose_1.default.model('Schedule', scheduleSchema);
//# sourceMappingURL=Schedule.js.map