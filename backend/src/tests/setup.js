const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRE = '7d';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Disconnect and stop server after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
