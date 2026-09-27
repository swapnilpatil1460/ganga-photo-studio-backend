import request from 'supertest';
import app from '../app';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { encryptBuffer, decryptBuffer } from '../services/backup.service';

let mongoServer: MongoMemoryServer;
let ownerToken: string;
let employeeToken: string;
let employeeId: string;
let otherEmployeeId: string;

jest.setTimeout(30000);

beforeAll(async () => {
  process.env.JWT_SECRET = 'security-test-secret-key-32chars!';
  process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // 1. Create Owner
  const owner = new User({
    email: 'owner@ganga.com',
    password: 'OwnerPassword123!',
    role: 'owner',
    tokenVersion: 0
  });
  await owner.save();

  // 2. Create Employees
  const emp1 = new Employee({
    name: 'Alice Photographer',
    email: 'alice@ganga.com',
    phone: '9876543210',
    role: 'Photographer',
    salaryStructure: { basicSalary: 30000, allowances: 5000 }
  });
  const savedEmp1 = await emp1.save();
  employeeId = String(savedEmp1._id);

  const empUser1 = new User({
    email: 'alice@ganga.com',
    password: 'AlicePassword123!',
    role: 'employee',
    tokenVersion: 0
  });
  await empUser1.save();

  const emp2 = new Employee({
    name: 'Bob Editor',
    email: 'bob@ganga.com',
    phone: '9876543211',
    role: 'Editor',
    salaryStructure: { basicSalary: 25000, allowances: 4000 }
  });
  const savedEmp2 = await emp2.save();
  otherEmployeeId = String(savedEmp2._id);

  const empUser2 = new User({
    email: 'bob@ganga.com',
    password: 'BobPassword123!',
    role: 'employee',
    tokenVersion: 0
  });
  await empUser2.save();

  // Log in as Owner
  const ownerLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'owner@ganga.com', password: 'OwnerPassword123!' });
  ownerToken = ownerLogin.body.token;

  // Log in as Alice
  const empLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@ganga.com', password: 'AlicePassword123!' });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Security Hardening & IDOR Protection', () => {
  it('1. GET /api/employees should not return password or encryptedPassword', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    const emps = res.body.data;
    expect(emps.length).toBeGreaterThanOrEqual(2);
    for (const emp of emps) {
      expect(emp.password).toBeUndefined();
      expect(emp.passwordHash).toBeUndefined();
      expect(emp.encryptedPassword).toBeUndefined();
    }
  });

  it('2. GET /api/employees should hide salaryStructure from non-owners', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    const emps = res.body.data;
    const bob = emps.find((e: any) => e.email === 'bob@ganga.com');
    expect(bob).toBeDefined();
    // Non-owner (Alice) must NOT see Bob's salary
    expect(bob.salaryStructure).toBeUndefined();
  });

  it('3. GET /api/employees/:id should prevent non-owner from seeing other employee salary', async () => {
    // Alice requests Bob's details
    const res = await request(app)
      .get(`/api/employees/${otherEmployeeId}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.salaryStructure).toBeUndefined();
  });

  it('4. GET /api/employees/:id/activities should block non-owner accessing other employee activities (IDOR defense)', async () => {
    // Alice tries to inspect Bob's activities
    const res = await request(app)
      .get(`/api/employees/${otherEmployeeId}/activities`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  it('5. GET /api/backup/history should block non-owners from accessing backup data', async () => {
    const res = await request(app)
      .get('/api/backup/history')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });

  it('6. POST /api/backup/run should allow owner to generate encrypted backup', async () => {
    const res = await request(app)
      .post('/api/backup/run')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.record).toBeDefined();
    expect(res.body.record.status).toBe('success');
    expect(res.body.record.filename).toMatch(/\.gz\.enc$/);
  });

  it('7. AES-256-GCM buffer encryption and decryption should roundtrip seamlessly', () => {
    const sample = Buffer.from('Ganga Photo Studio Database Snapshot', 'utf8');
    const encrypted = encryptBuffer(sample);
    expect(encrypted.length).toBeGreaterThan(sample.length);
    const decrypted = decryptBuffer(encrypted);
    expect(decrypted.toString('utf8')).toBe('Ganga Photo Studio Database Snapshot');
  });
});
