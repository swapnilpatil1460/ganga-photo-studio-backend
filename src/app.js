"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const customers_1 = __importDefault(require("./routes/customers"));
const services_1 = __importDefault(require("./routes/services"));
const employees_1 = __importDefault(require("./routes/employees"));
const orders_1 = __importDefault(require("./routes/orders"));
const users_1 = __importDefault(require("./routes/users"));
const schedule_1 = __importDefault(require("./routes/schedule"));
const settings_1 = __importDefault(require("./routes/settings"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const app = (0, express_1.default)();
// Global rate limiter: max 300 requests per 15 minutes per IP
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);
const allowedOrigins = [
    'http://localhost:5173',
    'https://ganga-photo-studio-frontend-srock.vercel.app'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/services', services_1.default);
app.use('/api/employees', employees_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/users', users_1.default);
app.use('/api/schedule', schedule_1.default);
app.use('/api/settings', settings_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map