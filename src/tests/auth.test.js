"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const User_1 = require("../models/User");
describe('Auth API', () => {
    beforeEach(async () => {
        // Create a real test user in the memory DB
        const user = new User_1.User({
            email: 'testowner@ganga.com',
            password: 'testpassword123',
            role: 'owner'
        });
        await user.save(); // Triggers bcrypt pre-save hook
    });
    it('should return 400 if email or password is missing', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: 'test@example.com'
        });
        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
    it('should authenticate a valid user and return a token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: 'testowner@ganga.com',
            password: 'testpassword123'
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.role).toBe('owner');
    });
    it('should return 401 for invalid password', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: 'testowner@ganga.com',
            password: 'wrongpassword'
        });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });
});
//# sourceMappingURL=auth.test.js.map