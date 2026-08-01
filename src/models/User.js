"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['owner', 'employee', 'customer'], default: 'employee' },
    settings: {
        theme: { type: String, default: 'theme-dashboard' },
        studioName: { type: String, default: 'Ganga Photo Studio' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        gstId: { type: String, default: '' }
    }
});
userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map