const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');
const MaintenanceRecord = require('../models/MaintenanceRecord');

describe('Maintenance Controller', () => {
  let adminToken;
  let driverToken;
  let truckId;
  let trailerId;
  let maintenanceId;

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
      plateNumber: 'TRK-MAINT-1234',
      brand: 'Mercedes',
      model: 'Actros',
      year: 2022,
      mileage: 50000,
      status: 'available',
    });
    truckId = truck._id;

    // Create trailer
    const trailer = await Trailer.create({
      plateNumber: 'TRL-MAINT-1111',
      capacity: 25000,
      mileage: 30000,
      status: 'available',
    });
    trailerId = trailer._id;

    // Create maintenance record
    const maintenance = await MaintenanceRecord.create({
      truckId,
      type: 'oil_change',
      scheduledDate: new Date('2024-12-20'),
      mileageAtMaintenance: 50000,
      intervalKm: 10000,
      status: 'scheduled',
    });
    maintenanceId = maintenance._id;
  });

  describe('GET /api/maintenance', () => {
    it('should get all maintenance records as admin', async () => {
      const res = await request(app)
        .get('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it('should not allow driver to access maintenance', async () => {
      const res = await request(app)
        .get('/api/maintenance')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should filter maintenance by type', async () => {
      const res = await request(app)
        .get('/api/maintenance?type=oil_change')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].type).toBe('oil_change');
    });

    it('should filter maintenance by status', async () => {
      const res = await request(app)
        .get('/api/maintenance?status=scheduled')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });
  });

  describe('GET /api/trucks/:truckId/maintenance', () => {
    it('should get maintenance for specific truck', async () => {
      const res = await request(app)
        .get(`/api/trucks/${truckId}/maintenance`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].type).toBe('oil_change');
    });

    it('should return 404 for non-existent truck', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/trucks/${fakeId}/maintenance`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/maintenance', () => {
    it('should create maintenance record for truck', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          truckId,
          type: 'tire_change',
          scheduledDate: '2024-12-25',
          mileageAtMaintenance: 51000,
          intervalKm: 5000,
          status: 'pending',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('tire_change');
    });

    it('should create maintenance record for trailer', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          trailerId,
          type: 'service',
          scheduledDate: '2024-12-30',
          status: 'scheduled',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('service');
    });

    it('should not create maintenance with non-existent truck', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          truckId: fakeId,
          type: 'oil_change',
          scheduledDate: '2024-12-25',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should not allow driver to create maintenance', async () => {
      const res = await request(app)
        .post('/api/maintenance')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          truckId,
          type: 'oil_change',
          scheduledDate: '2024-12-25',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/maintenance/:id/complete', () => {
    it('should complete maintenance', async () => {
      const res = await request(app)
        .patch(`/api/maintenance/${maintenanceId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileageAtMaintenance: 50500,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.completedDate).toBeDefined();
    });

    it('should not complete already completed maintenance', async () => {
      // Complete first time
      await MaintenanceRecord.findByIdAndUpdate(maintenanceId, {
        status: 'completed',
        completedDate: new Date(),
      });

      const res = await request(app)
        .patch(`/api/maintenance/${maintenanceId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          mileageAtMaintenance: 50500,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Maintenance already completed');
    });
  });

  describe('GET /api/maintenance/alerts/pending', () => {
    it('should get pending maintenance', async () => {
      const res = await request(app)
        .get('/api/maintenance/alerts/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].status).toBe('scheduled');
    });

    it('should not show completed maintenance', async () => {
      await MaintenanceRecord.findByIdAndUpdate(maintenanceId, {
        status: 'completed',
      });

      const res = await request(app)
        .get('/api/maintenance/alerts/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
    });
  });

  describe('GET /api/maintenance/alerts/overdue', () => {
    beforeEach(async () => {
      // Create overdue maintenance
      await MaintenanceRecord.create({
        truckId,
        type: 'service',
        scheduledDate: new Date('2024-11-01'), // Past date
        status: 'scheduled',
      });
    });

    it('should get overdue maintenance', async () => {
      const res = await request(app)
        .get('/api/maintenance/alerts/overdue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/maintenance/:id', () => {
    it('should delete maintenance as admin', async () => {
      const res = await request(app)
        .delete(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const maintenance = await MaintenanceRecord.findById(maintenanceId);
      expect(maintenance).toBeNull();
    });

    it('should not delete maintenance as driver', async () => {
      const res = await request(app)
        .delete(`/api/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
