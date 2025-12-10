const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const truckRoutes = require('./routes/truckRoutes');
const trailerRoutes = require('./routes/trailerRoutes');
const tireRoutes = require('./routes/tireRoutes');
const fuelRoutes = require('./routes/fuelRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/trailers', trailerRoutes);
app.use('/api/tires', tireRoutes);
app.use('/api/fuel', fuelRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;