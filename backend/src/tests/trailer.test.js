const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Trailer = require('../models/Trailer');

describe('Trailer Controller', () => {
  let adminToken;
  let driverToken;
  let trailerId;

  beforeEach(async () => {
    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create driver user
    await User.create({
      name: 'Driver User',
      email: 'driver@example.com',
      password: 'driver123',
      role: 'driver',
    });

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });
    adminToken = adminRes.body.data.token;

    // Login as driver
    const driverRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'driver@example.com',
        password: 'driver123',
      });
    driverToken = driverRes.body.data.token;

    // Create a test trailer
    const trailer = await Trailer.create({
      plateNumber: 'TRL-TEST-1111',
      capacity: 25000,
      mileage: 30000,
      status: 'available',
    });
    trailerId = trailer._id;
  });

  describe('GET /api/trailers', () => {
    it('should get all trailers with valid token', async () => {
      const res = await request(app)
        .get('/api/trailers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].plateNumber).toBe('TRL-TEST-1111');
    });

    it('should not get trailers without token', async () => {
      const res = await request(app).get('/api/trailers');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/trailers/:id', () => {
    it('should get single trailer', async () => {
      const res = await request(app)
        .get(`/api/trailers/${trailerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.plateNumber).toBe('TRL-TEST-1111');
    });

    it('should return 404 for non-existent trailer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/trailers/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/trailers', () => {
    it('should create trailer as admin', async () => {
      const res = await request(app)
        .post('/api/trailers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plateNumber: 'TRL-NEW-2222',
          capacity: 30000,
          mileage: 5000,
          status: 'available',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.plateNumber).toBe('TRL-NEW-2222');
      expect(res.body.data.capacity).toBe(30000);
    });

    it('should not create trailer as driver', async () => {
      const res = await request(app)
        .post('/api/trailers')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          plateNumber: 'TRL-NEW-2222',
          capacity: 30000,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not create trailer with duplicate plate number', async () => {
      const res = await request(app)
        .post('/api/trailers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plateNumber: 'TRL-TEST-1111', // Already exists
          capacity: 30000,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should not create trailer without required fields', async () => {
      const res = await request(app)
        .post('/api/trailers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plateNumber: 'TRL-NEW-3333',
          // Missing capacity
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/trailers/:id', () => {
    it('should update trailer as admin', async () => {
      const res = await request(app)
        .put(`/api/trailers/${trailerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileage: 35000,
          status: 'maintenance',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mileage).toBe(35000);
      expect(res.body.data.status).toBe('maintenance');
    });

    it('should not update trailer as driver', async () => {
      const res = await request(app)
        .put(`/api/trailers/${trailerId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          mileage: 35000,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent trailer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/trailers/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileage: 35000,
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/trailers/:id', () => {
    it('should delete trailer as admin', async () => {
      const res = await request(app)
        .delete(`/api/trailers/${trailerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const trailer = await Trailer.findById(trailerId);
      expect(trailer).toBeNull();
    });

    it('should not delete trailer as driver', async () => {
      const res = await request(app)
        .delete(`/api/trailers/${trailerId}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent trailer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/trailers/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
