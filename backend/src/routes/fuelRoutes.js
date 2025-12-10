const express = require('express');
const { getFuelRecords, getFuelRecord, createFuelRecord, updateFuelRecord, deleteFuelRecord, getFuelConsumptionReport } = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Authentication
router.use(protect);

router.get('/reports/consumption', authorize('admin'), getFuelConsumptionReport);
router.route('/').get(getFuelRecords).post(createFuelRecord);
router.route('/:id').get(getFuelRecord).put(authorize('admin'), updateFuelRecord).delete(authorize('admin'), deleteFuelRecord);

module.exports = router;