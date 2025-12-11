const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');
const Tire = require('../models/Tire');

describe('Tire Controller', () => {
  let adminToken;
  let driverToken;
  let truckId;
  let trailerId;
  let tireId;

  beforeEach(async () => {
    // Create users
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'Driver User',
      email: 'driver@example.com',
      password: 'driver123',
      role: 'driver',
    });

    // Login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    const driverRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'driver@example.com', password: 'driver123' });
    driverToken = driverRes.body.data.token;

    // Create truck
    const truck = await Truck.create({
      plateNumber: 'TRK-TEST-1234',
      brand: 'Mercedes',
      model: 'Actros',
      year: 2022,
      mileage: 50000,
      status: 'available',
    });
    truckId = truck._id;

    // Create trailer
    const trailer = await Trailer.create({
      plateNumber: 'TRL-TEST-1111',
      capacity: 25000,
      mileage: 30000,
      status: 'available',
    });
    trailerId = trailer._id;

    // Create tire
    const tire = await Tire.create({
      truckId,
      position: 'front_left',
      brand: 'Michelin',
      installDate: new Date('2024-01-15'),
      condition: 'good',
      mileageAtInstall: 50000,
    });
    tireId = tire._id;
  });

  describe('GET /api/tires', () => {
    it('should get all tires', async () => {
      const res = await request(app)
        .get('/api/tires')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it('should filter tires by truck', async () => {
      const res = await request(app)
        .get(`/api/tires?truckId=${truckId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].position).toBe('front_left');
    });

    it('should filter tires by condition', async () => {
      const res = await request(app)
        .get('/api/tires?condition=good')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });
  });

  describe('GET /api/trucks/:truckId/tires', () => {
    it('should get tires for specific truck', async () => {
      const res = await request(app)
        .get(`/api/trucks/${truckId}/tires`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].brand).toBe('Michelin');
    });

    it('should return 404 for non-existent truck', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/trucks/${fakeId}/tires`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/tires', () => {
    it('should create tire for truck as admin', async () => {
      const res = await request(app)
        .post('/api/tires')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          truckId,
          position: 'front_right',
          brand: 'Bridgestone',
          installDate: '2024-02-01',
          condition: 'good',
          mileageAtInstall: 51000,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.brand).toBe('Bridgestone');
      expect(res.body.data.position).toBe('front_right');
    });

    it('should create tire for trailer as admin', async () => {
      const res = await request(app)
        .post('/api/tires')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          trailerId,
          position: 'rear_left_outer',
          brand: 'Continental',
          installDate: '2024-02-01',
          condition: 'good',
          mileageAtInstall: 30000,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.brand).toBe('Continental');
    });

    it('should not create tire as driver', async () => {
      const res = await request(app)
        .post('/api/tires')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          truckId,
          position: 'front_right',
          brand: 'Bridgestone',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not create tire with non-existent truck', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/tires')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          truckId: fakeId,
          position: 'front_right',
          brand: 'Bridgestone',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/tires/:id/condition', () => {
    it('should update tire condition', async () => {
      const res = await request(app)
        .patch(`/api/tires/${tireId}/condition`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          condition: 'worn',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.condition).toBe('worn');
    });

    it('should not update with invalid condition', async () => {
      const res = await request(app)
        .patch(`/api/tires/${tireId}/condition`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          condition: 'invalid_condition',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow driver to update tire condition', async () => {
      const res = await request(app)
        .patch(`/api/tires/${tireId}/condition`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          condition: 'needs_replacement',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.condition).toBe('needs_replacement');
    });
  });

  describe('GET /api/tires/alerts/replacement', () => {
    beforeEach(async () => {
      await Tire.create({
        truckId,
        position: 'rear_left_outer',
        brand: 'Goodyear',
        condition: 'needs_replacement',
        mileageAtInstall: 48000,
      });
    });

    it('should get tires needing replacement', async () => {
      const res = await request(app)
        .get('/api/tires/alerts/replacement')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].condition).toBe('needs_replacement');
    });

    it('should not allow driver to access alerts', async () => {
      const res = await request(app)
        .get('/api/tires/alerts/replacement')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tires/:id', () => {
    it('should delete tire as admin', async () => {
      const res = await request(app)
        .delete(`/api/tires/${tireId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const tire = await Tire.findById(tireId);
      expect(tire).toBeNull();
    });

    it('should not delete tire as driver', async () => {
      const res = await request(app)
        .delete(`/api/tires/${tireId}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
