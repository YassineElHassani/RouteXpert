const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Truck = require('../models/Truck');
const Trip = require('../models/Trip');
const FuelRecord = require('../models/FuelRecord');

describe('Fuel Controller', () => {
  let adminToken;
  let driverToken;
  let driverId;
  let truckId;
  let tripId;
  let fuelRecordId;

  beforeEach(async () => {
    // Create users
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    const driver = await User.create({
      name: 'Driver User',
      email: 'driver@example.com',
      password: 'driver123',
      role: 'driver',
    });
    driverId = driver._id;

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
      plateNumber: 'TRK-FUEL-1234',
      brand: 'Mercedes',
      model: 'Actros',
      year: 2022,
      mileage: 50000,
      status: 'available',
    });
    truckId = truck._id;

    // Create trip
    const trip = await Trip.create({
      origin: 'Casablanca',
      destination: 'Marrakech',
      distance: 240,
      driverId,
      truckId,
      status: 'in_progress',
    });
    tripId = trip._id;

    // Create fuel record
    const fuelRecord = await FuelRecord.create({
      tripId,
      truckId,
      volume: 150,
      cost: 1500,
      date: new Date('2024-12-10'),
      location: 'Casablanca Station',
    });
    fuelRecordId = fuelRecord._id;
  });

  describe('GET /api/fuel', () => {
    it('should get all fuel records', async () => {
      const res = await request(app)
        .get('/api/fuel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it('should filter fuel records by truck', async () => {
      const res = await request(app)
        .get(`/api/fuel?truckId=${truckId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it('should filter fuel records by date range', async () => {
      const res = await request(app)
        .get('/api/fuel?startDate=2024-12-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
    });

    it('should allow driver to view fuel records', async () => {
      const res = await request(app)
        .get('/api/fuel')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/trucks/:truckId/fuel', () => {
    it('should get fuel records for specific truck', async () => {
      const res = await request(app)
        .get(`/api/trucks/${truckId}/fuel`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.totalVolume).toBe(150);
      expect(res.body.summary.totalCost).toBe(1500);
    });

    it('should return 404 for non-existent truck', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/trucks/${fakeId}/fuel`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/fuel', () => {
    it('should create fuel record', async () => {
      const res = await request(app)
        .post('/api/fuel')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          tripId,
          truckId,
          volume: 200,
          cost: 2000,
          date: '2024-12-11',
          location: 'Marrakech Station',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.volume).toBe(200);
      expect(res.body.data.cost).toBe(2000);
    });

    it('should not create fuel record with non-existent trip', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/fuel')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          tripId: fakeId,
          truckId,
          volume: 200,
          cost: 2000,
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should not create fuel record with mismatched truck', async () => {
      // Create another truck
      const anotherTruck = await Truck.create({
        plateNumber: 'TRK-OTHER-5678',
        brand: 'Volvo',
        model: 'FH16',
        year: 2021,
      });

      const res = await request(app)
        .post('/api/fuel')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          tripId,
          truckId: anotherTruck._id,
          volume: 200,
          cost: 2000,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Truck does not match the trip');
    });
  });

  describe('PUT /api/fuel/:id', () => {
    it('should update fuel record as admin', async () => {
      const res = await request(app)
        .put(`/api/fuel/${fuelRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          volume: 180,
          cost: 1800,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.volume).toBe(180);
      expect(res.body.data.cost).toBe(1800);
    });

    it('should not update fuel record as driver', async () => {
      const res = await request(app)
        .put(`/api/fuel/${fuelRecordId}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          volume: 180,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/fuel/reports/consumption', () => {
    it('should get fuel consumption report as admin', async () => {
      const res = await request(app)
        .get('/api/fuel/reports/consumption')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary).toBeDefined();
      expect(res.body.summary.totalVolume).toBe('150.00');
      expect(res.body.summary.totalCost).toBe('1500.00');
      expect(res.body.byTruck).toBeDefined();
    });

    it('should not allow driver to access reports', async () => {
      const res = await request(app)
        .get('/api/fuel/reports/consumption')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should filter report by date range', async () => {
      const res = await request(app)
        .get('/api/fuel/reports/consumption?startDate=2024-12-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.recordCount).toBe(1);
    });
  });

  describe('DELETE /api/fuel/:id', () => {
    it('should delete fuel record as admin', async () => {
      const res = await request(app)
        .delete(`/api/fuel/${fuelRecordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const fuelRecord = await FuelRecord.findById(fuelRecordId);
      expect(fuelRecord).toBeNull();
    });

    it('should not delete fuel record as driver', async () => {
      const res = await request(app)
        .delete(`/api/fuel/${fuelRecordId}`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
