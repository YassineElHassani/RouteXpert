const express = require('express');
const { getTrips, getTrip, createTrip, updateTrip, deleteTrip, updateTripStatus, updateTripMileage, getMyTrips, downloadTripPDF } = require('../controllers/tripController');
const { getTripFuelRecords } = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Auth
router.use(protect);

router.get('/my-trips', getMyTrips);
router.route('/').get(getTrips).post(authorize('admin'), createTrip);
router.route('/:id').get(getTrip).put(authorize('admin'), updateTrip).delete(authorize('admin'), deleteTrip);
router.route('/:id/status').patch(updateTripStatus);
router.route('/:id/mileage').patch(updateTripMileage);
router.route('/:id/pdf').get(downloadTripPDF);
router.get('/:tripId/fuel', getTripFuelRecords);

module.exports = router;