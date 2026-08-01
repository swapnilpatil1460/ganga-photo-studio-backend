"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Customer_1 = require("./src/models/Customer");
const Employee_1 = require("./src/models/Employee");
dotenv_1.default.config();
async function clearOldData() {
    if (!process.env.MONGODB_URI) {
        console.log('No MONGODB_URI found.');
        return;
    }
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        // Delete dummy employees (e.g. John Editor, Sarah Photo, or all?)
        // Let's just wipe the collections since it's early development and they want them cleared
        await Customer_1.Customer.deleteMany({});
        console.log('All customer entries removed.');
        await Employee_1.Employee.deleteMany({});
        console.log('All employee entries removed.');
        await mongoose_1.default.disconnect();
        console.log('Done.');
    }
    catch (err) {
        console.error(err);
    }
}
clearOldData();
//# sourceMappingURL=clearDB.js.map