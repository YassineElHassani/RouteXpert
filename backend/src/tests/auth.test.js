const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'driver',
          phone: '+212600000000',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should not register user with duplicate email', async () => {
      // Create first user
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'driver',
      });

      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'driver',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User already exists');
    });

    it('should not register user without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'driver',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'driver',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      token = res.body.data.token;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should not get user without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
