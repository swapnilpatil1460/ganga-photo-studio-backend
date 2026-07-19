import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

let token: string;

beforeAll(() => {
  // Generate a valid mock token for testing protected routes
  token = jwt.sign(
    { email: 'owner@ganga.com', role: 'owner' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
});

describe('Customers API', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401); // Unauthorized
  });

  it('should fetch an empty paginated customer list initially', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(0);
  });

  it('should create a new customer', async () => {
    const res = await request(app)
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
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'No Phone Customer'
      });
      
    expect(res.status).toBe(400); // Because phone is required
  });
});
