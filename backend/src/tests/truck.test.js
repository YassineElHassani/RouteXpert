const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Truck = require('../models/Truck');

describe('Truck Controller', () => {
  let adminToken;
  let driverToken;
  let truckId;

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

    // Create a test truck
    const truck = await Truck.create({
      plateNumber: 'TEST-1234',
      brand: 'Mercedes',
      model: 'Actros',
      year: 2022,
      mileage: 50000,
      status: 'available',
    });
    truckId = truck._id;
  });

  describe('GET /api/trucks', () => {
    it('should get all trucks with valid token', async () => {
      const res = await request(app)
        .get('/api/trucks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].plateNumber).toBe('TEST-1234');
    });

    it('should not get trucks without token', async () => {
      const res = await request(app).get('/api/trucks');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/trucks', () => {
    it('should create truck as admin', async () => {
      const res = await request(app)
        .post('/api/trucks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plateNumber: 'NEW-5678',
          brand: 'Volvo',
          model: 'FH16',
          year: 2023,
          mileage: 10000,
          status: 'available',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.plateNumber).toBe('NEW-5678');
    });

    it('should not create truck as driver', async () => {
      const res = await request(app)
        .post('/api/trucks')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          plateNumber: 'NEW-5678',
          brand: 'Volvo',
          model: 'FH16',
          year: 2023,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not create truck with duplicate plate number', async () => {
      const res = await request(app)
        .post('/api/trucks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plateNumber: 'TEST-1234', // Already exists
          brand: 'Volvo',
          model: 'FH16',
          year: 2023,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/trucks/:id', () => {
    it('should update truck as admin', async () => {
      const res = await request(app)
        .put(`/api/trucks/${truckId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileage: 55000,
          status: 'maintenance',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mileage).toBe(55000);
      expect(res.body.data.status).toBe('maintenance');
    });

    it('should not update truck as driver', async () => {
      const res = await request(app)
        .put(`/api/trucks/${truckId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          mileage: 55000,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/trucks/:id', () => {
    it('should delete truck as admin', async () => {
      const res = await request(app)
        .delete(`/api/trucks/${truckId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const truck = await Truck.findById(truckId);
      expect(truck).toBeNull();
    });

    it('should not delete truck as driver', async () => {
      const res = await request(app)
        .delete(`/api/trucks/${truckId}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/trucks/:id/mileage', () => {
    it('should update truck mileage', async () => {
      const res = await request(app)
        .patch(`/api/trucks/${truckId}/mileage`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileage: 52000,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mileage).toBe(52000);
    });

    it('should not update with lower mileage', async () => {
      const res = await request(app)
        .patch(`/api/trucks/${truckId}/mileage`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileage: 40000, // Less than current 50000
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
