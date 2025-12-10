const express = require('express');
const { getTrailers, getTrailer, createTrailer, updateTrailer, deleteTrailer } = require('../controllers/trailerController');
const { getTrailerTires } = require('../controllers/tireController');
const { getTrailerMaintenance } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Auth
router.use(protect);

router.route('/').get(getTrailers).post(authorize('admin'), createTrailer);
router.route('/:id').get(getTrailer).put(authorize('admin'), updateTrailer).delete(authorize('admin'), deleteTrailer);
router.get('/:trailerId/tires', getTrailerTires);
router.get('/:trailerId/maintenance', authorize('admin'), getTrailerMaintenance);

module.exports = router;