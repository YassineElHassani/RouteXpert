const express = require('express');
const { getFuelRecords, getFuelRecord, createFuelRecord, updateFuelRecord, deleteFuelRecord, getFuelConsumptionReport } = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Auth
router.use(protect);

router.get('/reports/consumption', getFuelConsumptionReport);
router.route('/').get(getFuelRecords).post(createFuelRecord);
router.route('/:id').get(getFuelRecord).put(updateFuelRecord).delete(deleteFuelRecord);

module.exports = router;