"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Customer_1 = require("../models/Customer");
let token;
let customerId;
beforeAll(async () => {
    // Generate a valid mock token for testing protected routes
    token = jsonwebtoken_1.default.sign({ email: 'owner@ganga.com', role: 'owner' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    // Need a customer to create an order
    const customer = new Customer_1.Customer({
        name: 'Order Test Customer',
        phone: '9998887776',
        email: 'order@customer.com'
    });
    await customer.save();
    customerId = customer._id.toString();
});
describe('Orders API', () => {
    it('should fetch an empty paginated order list initially', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/orders')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.total).toBe(0);
    });
    it('should create a new order', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
            customer: customerId,
            service: 'Photography',
            quantity: 1,
            price: 5000,
            totalAmount: 5000,
            paidAmount: 1000,
            assignedEmployee: 'John Doe',
            expectedDeliveryDate: new Date().toISOString()
        });
        expect(res.status).toBe(201);
        expect(res.body.service).toBe('Photography');
        expect(res.body.status).toBe('Received');
        expect(res.body.orderId).toMatch(/^ORD-\d+$/);
    });
    it('should fetch the analytics dashboard data', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/orders/analytics')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.totalOrders).toBeDefined();
        expect(res.body.pendingOrders).toBeDefined();
        expect(res.body.monthlyRevenue).toBeDefined();
    });
});
//# sourceMappingURL=orders.test.js.map