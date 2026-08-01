"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let token;
beforeAll(() => {
    // Generate a valid mock token for testing protected routes
    token = jsonwebtoken_1.default.sign({ email: 'owner@ganga.com', role: 'owner' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
});
describe('Customers API', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/customers');
        expect(res.status).toBe(401); // Unauthorized
    });
    it('should fetch an empty paginated customer list initially', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/customers')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.total).toBe(0);
    });
    it('should create a new customer', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/customers')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'Test Customer',
            phone: '1234567890',
            email: 'test@customer.com'
        });
        expect(res.status).toBe(201);
        expect(res.body.customer.name).toBe('Test Customer');
        expect(res.body.customer.phone).toBe('1234567890');
        expect(res.body.customer.customerId).toMatch(/^CUS-\d+$/);
    });
    it('should return 400 if required fields are missing', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/customers')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'No Phone Customer'
        });
        expect(res.status).toBe(400); // Because phone is required
    });
});
//# sourceMappingURL=customers.test.js.map