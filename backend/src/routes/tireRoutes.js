const express = require('express');
const { getTires, getTire, createTire, updateTire, deleteTire, updateTireCondition, getTiresNeedingReplacement } = require('../controllers/tireController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/alerts/replacement', authorize('admin'), getTiresNeedingReplacement);
router.route('/').get(getTires).post(authorize('admin'), createTire);
router.route('/:id').get(getTire).put(authorize('admin'), updateTire).delete(authorize('admin'), deleteTire);
router.route('/:id/condition').patch(updateTireCondition);

module.exports = router;