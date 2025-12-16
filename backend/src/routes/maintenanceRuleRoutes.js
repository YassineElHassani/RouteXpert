const express = require('express');
const router = express.Router();
const {
  getMaintenanceRules,
  getMaintenanceRule,
  createMaintenanceRule,
  updateMaintenanceRule,
  deleteMaintenanceRule,
  getMaintenanceDashboard,
} = require('../controllers/maintenanceRuleController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Dashboard route (admin only)
router.get('/dashboard', authorize('admin'), getMaintenanceDashboard);

// CRUD routes
router
  .route('/')
  .get(getMaintenanceRules)
  .post(authorize('admin'), createMaintenanceRule);

router
  .route('/:id')
  .get(getMaintenanceRule)
  .put(authorize('admin'), updateMaintenanceRule)
  .delete(authorize('admin'), deleteMaintenanceRule);

module.exports = router;
