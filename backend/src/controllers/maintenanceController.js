const MaintenanceRecord = require('../models/MaintenanceRecord');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');

// Get all maintenance records
// GET /api/maintenance
exports.getMaintenanceRecords = async (req, res, next) => {
    try {
        const { truckId, trailerId, type, status, startDate, endDate } = req.query;

        // Build filter
        let filter = {};
        if (truckId) filter.truckId = truckId;
        if (trailerId) filter.trailerId = trailerId;
        if (type) filter.type = type;
        if (status) filter.status = status;

        // Date range filter
        if (startDate || endDate) {
            filter.scheduledDate = {};
            if (startDate) filter.scheduledDate.$gte = new Date(startDate);
            if (endDate) filter.scheduledDate.$lte = new Date(endDate);
        }

        const records = await MaintenanceRecord.find(filter).populate('truckId', 'plateNumber brand model mileage').populate('trailerId', 'plateNumber capacity mileage').sort('-scheduledDate');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        next(error);
    }
};

// Get single maintenance record
// GET /api/maintenance/:id
exports.getMaintenanceRecord = async (req, res, next) => {
    try {
        const record = await MaintenanceRecord.findById(req.params.id).populate('truckId', 'plateNumber brand model mileage').populate('trailerId', 'plateNumber capacity mileage');

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Maintenance record not found',
            });
        }

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// Get maintenance records for a truck
// GET /api/trucks/:truckId/maintenance
exports.getTruckMaintenance = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.truckId);

        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        const records = await MaintenanceRecord.find({ truckId: req.params.truckId }).sort('-scheduledDate');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        next(error);
    }
};

// Get maintenance records for a trailer
// GET /api/trailers/:trailerId/maintenance
exports.getTrailerMaintenance = async (req, res, next) => {
    try {
        const trailer = await Trailer.findById(req.params.trailerId);

        if (!trailer) {
            return res.status(404).json({
                success: false,
                error: 'Trailer not found',
            });
        }

        const records = await MaintenanceRecord.find({ trailerId: req.params.trailerId }).sort('-scheduledDate');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        next(error);
    }
};

// Create new maintenance record
// POST /api/maintenance
exports.createMaintenanceRecord = async (req, res, next) => {
    try {
        const { truckId, trailerId } = req.body;

        // Validate truck or trailer exists
        if (truckId) {
            const truck = await Truck.findById(truckId);
            if (!truck) {
                return res.status(404).json({
                    success: false,
                    error: 'Truck not found',
                });
            }
        }

        if (trailerId) {
            const trailer = await Trailer.findById(trailerId);
            if (!trailer) {
                return res.status(404).json({
                    success: false,
                    error: 'Trailer not found',
                });
            }
        }

        const record = await MaintenanceRecord.create(req.body);

        res.status(201).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// Update maintenance record
// PUT /api/maintenance/:id
exports.updateMaintenanceRecord = async (req, res, next) => {
    try {
        const record = await MaintenanceRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        ).populate('truckId', 'plateNumber brand model').populate('trailerId', 'plateNumber capacity');

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Maintenance record not found',
            });
        }

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// Complete maintenance
// PATCH /api/maintenance/:id/complete
exports.completeMaintenance = async (req, res, next) => {
    try {
        const { mileageAtMaintenance } = req.body;

        const record = await MaintenanceRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Maintenance record not found',
            });
        }

        if (record.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Maintenance already completed',
            });
        }

        record.status = 'completed';
        record.completedDate = new Date();
        if (mileageAtMaintenance) {
            record.mileageAtMaintenance = mileageAtMaintenance;
        }

        await record.save();

        // Update vehicle status back to available
        if (record.truckId) {
            const truck = await Truck.findById(record.truckId);
            if (truck && truck.status === 'maintenance') {
                truck.status = 'available';
                await truck.save();
            }
        }

        if (record.trailerId) {
            const trailer = await Trailer.findById(record.trailerId);
            if (trailer && trailer.status === 'maintenance') {
                trailer.status = 'available';
                await trailer.save();
            }
        }

        await record.populate('truckId', 'plateNumber brand model');
        await record.populate('trailerId', 'plateNumber capacity');

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// Delete maintenance record
// DELETE /api/maintenance/:id
exports.deleteMaintenanceRecord = async (req, res, next) => {
    try {
        const record = await MaintenanceRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Maintenance record not found',
            });
        }

        await record.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// Get pending maintenance
// GET /api/maintenance/alerts/pending
exports.getPendingMaintenance = async (req, res, next) => {
    try {
        const records = await MaintenanceRecord.find({
            status: { $in: ['pending', 'scheduled'] },
        }).populate('truckId', 'plateNumber brand model mileage').populate('trailerId', 'plateNumber capacity mileage').sort('scheduledDate');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        next(error);
    }
};

// Get overdue maintenance
// GET /api/maintenance/alerts/overdue
exports.getOverdueMaintenance = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const records = await MaintenanceRecord.find({
            status: { $in: ['pending', 'scheduled'] },
            scheduledDate: { $lt: today },
        }).populate('truckId', 'plateNumber brand model mileage').populate('trailerId', 'plateNumber capacity mileage').sort('scheduledDate');

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        next(error);
    }
};