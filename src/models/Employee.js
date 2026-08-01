"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employeeSchema = new mongoose_1.default.Schema({
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
exports.Employee = mongoose_1.default.model('Employee', employeeSchema);
//# sourceMappingURL=Employee.js.map