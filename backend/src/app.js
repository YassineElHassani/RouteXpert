const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trucks', require('./routes/truckRoutes'));
app.use('/api/trailers', require('./routes/trailerRoutes'));
app.use('/api/tires', require('./routes/tireRoutes'));
app.use('/api/fuel', require('./routes/fuelRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/maintenance-rules', require('./routes/maintenanceRuleRoutes'));

// Error handler
app.use(errorHandler);

module.exports = app;