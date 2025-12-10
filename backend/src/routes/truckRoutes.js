const express = require('express');
const { getTrucks, getTruck, createTruck, updateTruck, deleteTruck, updateTruckMileage, } = require('../controllers/truckController');
const { getTruckTires } = require('../controllers/tireController');
const { getTruckFuelRecords } = require('../controllers/fuelController');
const { getTruckMaintenance } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Auth
router.use(protect);

router.route('/').get(getTrucks).post(authorize('admin'), createTruck);
router.route('/:id').get(getTruck).put(authorize('admin'), updateTruck).delete(authorize('admin'), deleteTruck);
router.route('/:id/mileage').patch(updateTruckMileage);
router.get('/:truckId/tires', getTruckTires);
router.get('/:truckId/fuel', getTruckFuelRecords);
router.get('/:truckId/maintenance', authorize('admin'), getTruckMaintenance);

module.exports = router;