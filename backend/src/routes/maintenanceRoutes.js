const express = require('express');
const { getMaintenanceRecords, getMaintenanceRecord, createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord, completeMaintenance, getPendingMaintenance, getOverdueMaintenance } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Auth and admin role
router.use(protect);
router.use(authorize('admin'));

// Alert routes
router.get('/alerts/pending', getPendingMaintenance);
router.get('/alerts/overdue', getOverdueMaintenance);

router.route('/').get(getMaintenanceRecords).post(createMaintenanceRecord);
router.route('/:id').get(getMaintenanceRecord).put(updateMaintenanceRecord).delete(deleteMaintenanceRecord);
router.route('/:id/complete').patch(completeMaintenance);

module.exports = router;