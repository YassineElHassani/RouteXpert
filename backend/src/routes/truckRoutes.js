const express = require('express');
const { getTrucks, getTruck, createTruck, updateTruck, deleteTruck, updateTruckMileage, } = require('../controllers/truckController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getTrucks).post(authorize('admin'), createTruck);
router.route('/:id').get(getTruck).put(authorize('admin'), updateTruck).delete(authorize('admin'), deleteTruck);
router.route('/:id/mileage').patch(updateTruckMileage);

module.exports = router;