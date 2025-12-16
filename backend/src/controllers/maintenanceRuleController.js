const MaintenanceRule = require('../models/MaintenanceRule');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const Truck = require('../models/Truck');

// Get all maintenance rules
// GET /api/maintenance-rules
exports.getMaintenanceRules = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const rules = await MaintenanceRule.find(filter).sort('-priority createdAt');

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

// Get single maintenance rule
// GET /api/maintenance-rules/:id
exports.getMaintenanceRule = async (req, res, next) => {
  try {
    const rule = await MaintenanceRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance rule not found',
      });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// Create maintenance rule
// POST /api/maintenance-rules
exports.createMaintenanceRule = async (req, res, next) => {
  try {
    const rule = await MaintenanceRule.create(req.body);

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// Update maintenance rule
// PUT /api/maintenance-rules/:id
exports.updateMaintenanceRule = async (req, res, next) => {
  try {
    const rule = await MaintenanceRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance rule not found',
      });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

// Delete maintenance rule
// DELETE /api/maintenance-rules/:id
exports.deleteMaintenanceRule = async (req, res, next) => {
  try {
    const rule = await MaintenanceRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance rule not found',
      });
    }

    await rule.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming maintenance for a specific truck
// GET /api/trucks/:truckId/upcoming-maintenance
exports.getUpcomingMaintenance = async (req, res, next) => {
  try {
    const truck = await Truck.findById(req.params.truckId);

    if (!truck) {
      return res.status(404).json({
        success: false,
        error: 'Truck not found',
      });
    }

    const activeRules = await MaintenanceRule.find({ isActive: true });
    const maintenanceRecords = await MaintenanceRecord.find({ 
      truckId: req.params.truckId 
    }).sort('-date');

    const upcomingMaintenance = [];
    const currentDate = new Date();
    const currentMileage = truck.mileage || 0;

    for (const rule of activeRules) {
      // Find the last maintenance of this category
      const lastMaintenance = maintenanceRecords.find(
        record => record.type === rule.category
      );

      let isDue = false;
      let dueInfo = {
        rule: rule,
        status: 'upcoming',
        lastPerformed: lastMaintenance ? lastMaintenance.date : null,
        lastMileage: lastMaintenance ? lastMaintenance.mileage : 0,
      };

      if (!lastMaintenance) {
        // Never performed - due now
        isDue = true;
        dueInfo.status = 'overdue';
        dueInfo.reason = 'Never performed';
      } else {
        // Check mileage-based interval
        if (rule.intervalType === 'mileage' || rule.intervalType === 'both') {
          const mileageSinceLastService = currentMileage - (lastMaintenance.mileage || 0);
          const mileageRemaining = rule.intervalMileage - mileageSinceLastService;
          
          dueInfo.mileageSinceLastService = mileageSinceLastService;
          dueInfo.mileageRemaining = mileageRemaining;
          dueInfo.nextDueMileage = (lastMaintenance.mileage || 0) + rule.intervalMileage;

          if (mileageRemaining <= 0) {
            isDue = true;
            dueInfo.status = 'overdue';
            dueInfo.reason = `Exceeded mileage interval by ${Math.abs(mileageRemaining)} km`;
          } else if (mileageRemaining <= rule.intervalMileage * 0.1) {
            isDue = true;
            dueInfo.status = 'due_soon';
            dueInfo.reason = `Due in ${mileageRemaining} km`;
          }
        }

        // Check time-based interval
        if (rule.intervalType === 'time' || rule.intervalType === 'both') {
          const daysSinceLastService = Math.floor(
            (currentDate - new Date(lastMaintenance.date)) / (1000 * 60 * 60 * 24)
          );
          const daysRemaining = rule.intervalDays - daysSinceLastService;
          
          dueInfo.daysSinceLastService = daysSinceLastService;
          dueInfo.daysRemaining = daysRemaining;
          dueInfo.nextDueDate = new Date(
            new Date(lastMaintenance.date).getTime() + (rule.intervalDays * 24 * 60 * 60 * 1000)
          );

          if (daysRemaining <= 0) {
            isDue = true;
            if (dueInfo.status !== 'overdue') {
              dueInfo.status = 'overdue';
            }
            dueInfo.reason = dueInfo.reason 
              ? `${dueInfo.reason} and exceeded time interval by ${Math.abs(daysRemaining)} days`
              : `Exceeded time interval by ${Math.abs(daysRemaining)} days`;
          } else if (daysRemaining <= rule.intervalDays * 0.1) {
            if (dueInfo.status === 'upcoming') {
              isDue = true;
              dueInfo.status = 'due_soon';
              dueInfo.reason = dueInfo.reason || `Due in ${daysRemaining} days`;
            }
          }
        }
      }

      if (isDue || dueInfo.status !== 'upcoming') {
        upcomingMaintenance.push(dueInfo);
      }
    }

    // Sort by priority and status
    upcomingMaintenance.sort((a, b) => {
      const statusPriority = { overdue: 0, due_soon: 1, upcoming: 2 };
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return priorityOrder[a.rule.priority] - priorityOrder[b.rule.priority];
    });

    res.status(200).json({
      success: true,
      truck: {
        id: truck._id,
        plateNumber: truck.plateNumber,
        currentMileage: currentMileage,
      },
      count: upcomingMaintenance.length,
      data: upcomingMaintenance,
    });
  } catch (error) {
    next(error);
  }
};

// Get maintenance dashboard (all trucks)
// GET /api/maintenance-rules/dashboard
exports.getMaintenanceDashboard = async (req, res, next) => {
  try {
    const trucks = await Truck.find({ status: { $ne: 'inactive' } });
    const activeRules = await MaintenanceRule.find({ isActive: true });
    
    let totalOverdue = 0;
    let totalDueSoon = 0;
    const trucksMaintenance = [];

    for (const truck of trucks) {
      const maintenanceRecords = await MaintenanceRecord.find({ 
        truckId: truck._id 
      }).sort('-date');

      let overdue = 0;
      let dueSoon = 0;
      const currentDate = new Date();
      const currentMileage = truck.mileage || 0;

      for (const rule of activeRules) {
        const lastMaintenance = maintenanceRecords.find(
          record => record.type === rule.category
        );

        if (!lastMaintenance) {
          overdue++;
          continue;
        }

        // Check mileage
        if (rule.intervalType === 'mileage' || rule.intervalType === 'both') {
          const mileageSinceLastService = currentMileage - (lastMaintenance.mileage || 0);
          if (mileageSinceLastService >= rule.intervalMileage) {
            overdue++;
            continue;
          } else if (mileageSinceLastService >= rule.intervalMileage * 0.9) {
            dueSoon++;
            continue;
          }
        }

        // Check time
        if (rule.intervalType === 'time' || rule.intervalType === 'both') {
          const daysSinceLastService = Math.floor(
            (currentDate - new Date(lastMaintenance.date)) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastService >= rule.intervalDays) {
            overdue++;
          } else if (daysSinceLastService >= rule.intervalDays * 0.9) {
            dueSoon++;
          }
        }
      }

      totalOverdue += overdue;
      totalDueSoon += dueSoon;

      if (overdue > 0 || dueSoon > 0) {
        trucksMaintenance.push({
          truck: {
            id: truck._id,
            plateNumber: truck.plateNumber,
            brand: truck.brand,
            model: truck.model,
          },
          overdue,
          dueSoon,
        });
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        totalTrucks: trucks.length,
        totalOverdue,
        totalDueSoon,
        trucksNeedingAttention: trucksMaintenance.length,
      },
      data: trucksMaintenance,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
