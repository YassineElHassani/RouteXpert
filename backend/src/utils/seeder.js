require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');
const Trip = require('../models/Trip');

const seedData = async () => {
  try {
    await connectDB();

    console.log('\n|=> Clearing existing data...');
    await User.deleteMany();
    await Truck.deleteMany();
    await Trailer.deleteMany();

    console.log('|=> Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@routexpert.com',
      password: 'admin123',
      role: 'admin',
      phone: '+212600000000',
    });

    const driver = await User.create({
      name: 'Driver User',
      email: 'driver@routexpert.com',
      password: 'driver123',
      role: 'driver',
      phone: '+212600000001',
    });

    const driver2 = await User.create({
      name: 'Driver two',
      email: 'driver2@routexpert.com',
      password: 'driver123',
      role: 'driver',
      phone: '+212600000002',
    });

    console.log('|=> Creating trucks...');
    const trucks = await Truck.create([
      {
        plateNumber: 'ABC-1234',
        brand: 'Mercedes',
        model: 'Actros',
        year: 2022,
        mileage: 50000,
        status: 'available',
      },
      {
        plateNumber: 'DEF-5678',
        brand: 'Volvo',
        model: 'FH16',
        year: 2021,
        mileage: 80000,
        status: 'available',
      },
      {
        plateNumber: 'GHI-9012',
        brand: 'Scania',
        model: 'R450',
        year: 2023,
        mileage: 25000,
        status: 'available',
      },
    ]);

    console.log('|=> Creating trailers...');
    const trailers = await Trailer.create([
      {
        plateNumber: 'TRL-1111',
        capacity: 25000,
        mileage: 30000,
        status: 'available',
      },
      {
        plateNumber: 'TRL-2222',
        capacity: 30000,
        mileage: 45000,
        status: 'available',
      },
      {
        plateNumber: 'TRL-3333',
        capacity: 28000,
        mileage: 15000,
        status: 'available',
      },
    ]);

    console.log('|=> Creating trips...');
    await Trip.create([
      {
        origin: 'Casablanca',
        destination: 'Marrakech',
        distance: 240,
        driverId: driver._id,
        truckId: trucks[0]._id,
        trailerId: trailers[0]._id,
        status: 'to_do',
        departureDate: null,
      },
      {
        origin: 'Rabat',
        destination: 'Tangier',
        distance: 250,
        driverId: driver2._id,
        truckId: trucks[1]._id,
        trailerId: trailers[1]._id,
        status: 'to_do',
        departureDate: null,
      },
    ]);

    console.log('\nData seeded successfully!');
    console.log('═════════════════════════════════════════');
    console.log('Admin:  admin@routexpert.com / admin123');
    console.log('Driver1: driver@routexpert.com / driver123');
    console.log('Driver2: driver2@routexpert.com / driver123');
    console.log('═════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();