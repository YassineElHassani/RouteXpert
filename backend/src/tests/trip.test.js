const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');
const Trip = require('../models/Trip');

describe('Trip Controller', () => {
  let adminToken;
  let driverToken;
  let driverId;
  let truckId;
  let trailerId;
  let tripId;

  beforeEach(async () => {
    // Create admin
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create driver
    const driver = await User.create({
      name: 'Driver User',
      email: 'driver@example.com',
      password: 'driver123',
      role: 'driver',
    });
    driverId = driver._id;

    // Login tokens
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
      plateNumber: 'TRK-1234',
      brand: 'Mercedes',
      model: 'Actros',
      year: 2022,
      mileage: 50000,
      status: 'available',
    });
    truckId = truck._id;

    // Create trailer
    const trailer = await Trailer.create({
      plateNumber: 'TRL-1111',
      capacity: 25000,
      mileage: 30000,
      status: 'available',
    });
    trailerId = trailer._id;

    // Create a test trip
    const trip = await Trip.create({
      origin: 'Casablanca',
      destination: 'Marrakech',
      distance: 240,
      driverId,
      truckId,
      trailerId,
      status: 'to_do',
    });
    tripId = trip._id;

    // Mark truck and trailer as in_use
    truck.status = 'in_use';
    await truck.save();
    trailer.status = 'in_use';
    await trailer.save();
  });

  describe('POST /api/trips', () => {
    it('should create trip as admin', async () => {
      // Reset truck to available
      await Truck.findByIdAndUpdate(truckId, { status: 'available' });
      await Trailer.findByIdAndUpdate(trailerId, { status: 'available' });

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          origin: 'Rabat',
          destination: 'Fes',
          distance: 200,
          driverId,
          truckId,
          trailerId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.origin).toBe('Rabat');

      // Verify truck status updated
      const truck = await Truck.findById(truckId);
      expect(truck.status).toBe('in_use');
    });

    it('should not create trip with unavailable truck', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          origin: 'Rabat',
          destination: 'Fes',
          distance: 200,
          driverId,
          truckId, // Already in_use
          trailerId,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should not create trip as driver', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          origin: 'Rabat',
          destination: 'Fes',
          distance: 200,
          driverId,
          truckId,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/trips/:id/status', () => {
    it('should update trip status to in_progress', async () => {
      const res = await request(app)
        .patch(`/api/trips/${tripId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'in_progress' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.departureDate).toBeDefined();
    });

    it('should update trip status to completed', async () => {
      // First set to in_progress
      await Trip.findByIdAndUpdate(tripId, { status: 'in_progress' });

      const res = await request(app)
        .patch(`/api/trips/${tripId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.arrivalDate).toBeDefined();

      // Verify truck status reset to available
      const truck = await Truck.findById(truckId);
      expect(truck.status).toBe('available');
    });

    it('should not skip status transition', async () => {
      const res = await request(app)
        .patch(`/api/trips/${tripId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'completed' }); // Skip in_progress

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/trips/:id/mileage', () => {
    it('should update trip mileage', async () => {
      const res = await request(app)
        .patch(`/api/trips/${tripId}/mileage`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          mileageStart: 50000,
          mileageEnd: 50240,
          dieselVolume: 100,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mileageStart).toBe(50000);
      expect(res.body.data.mileageEnd).toBe(50240);
    });

    it('should not update with invalid mileage', async () => {
      const res = await request(app)
        .patch(`/api/trips/${tripId}/mileage`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          mileageStart: 50000,
          mileageEnd: 49000, // Less than start
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/trips/my-trips', () => {
    it('should get driver own trips', async () => {
      const res = await request(app)
        .get('/api/trips/my-trips')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0]._id.toString()).toBe(tripId.toString());
    });
  });
});
