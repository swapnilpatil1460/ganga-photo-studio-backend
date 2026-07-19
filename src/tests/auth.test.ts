import request from 'supertest';
import app from '../app';
import { User } from '../models/User';

describe('Auth API', () => {
  beforeEach(async () => {
    // Create a real test user in the memory DB
    const user = new User({
      email: 'testowner@ganga.com',
      password: 'testpassword123',
      role: 'owner'
    });
    await user.save(); // Triggers bcrypt pre-save hook
  });

  it('should return 400 if email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com'
    });
    
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should authenticate a valid user and return a token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testowner@ganga.com',
      password: 'testpassword123'
    });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('owner');
  });

  it('should return 401 for invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testowner@ganga.com',
      password: 'wrongpassword'
    });
    
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});
