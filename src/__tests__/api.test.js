"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
let mongoServer;
beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose_1.default.connect(mongoUri);
    // Seed owner user
    const user = new User_1.User({
        email: 'owner@test.com',
        password: 'password123',
        role: 'owner'
    });
    await user.save();
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
});
describe('API Health and Auth', () => {
    it('GET /health should return 200', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
    it('POST /api/auth/login should return token for valid credentials', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: 'owner@test.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.role).toBe('owner');
    });
    it('POST /api/auth/login should reject invalid credentials', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: 'owner@test.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });
});
//# sourceMappingURL=api.test.js.map