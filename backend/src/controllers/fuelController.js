const FuelRecord = require('../models/FuelRecord');
const Trip = require('../models/Trip');
const Truck = require('../models/Truck');

// Get all fuel records
// GET /api/fuel
exports.getFuelRecords = async (req, res, next) => {
    try {
        const { tripId, truckId, startDate, endDate } = req.query;

        let filter = {};
        
        // If user is driver, only show fuel records for their trips
        if (req.user.role === 'driver') {
            const driverTrips = await Trip.find({ driverId: req.user._id }).select('_id');
            const tripIds = driverTrips.map(trip => trip._id);
            filter.tripId = { $in: tripIds };
        } else {
            if (tripId) filter.tripId = tripId;
        }
        
        if (truckId) filter.truckId = truckId;

        // Date range filter
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const fuelRecords = await FuelRecord.find(filter).populate('tripId', 'origin destination status').populate('truckId', 'plateNumber brand model').sort('-date');

        res.status(200).json({
            success: true,
            count: fuelRecords.length,
            data: fuelRecords,
        });
    } catch (error) {
        next(error);
    }
};

// Get single fuel record
// GET /api/fuel/:id
exports.getFuelRecord = async (req, res, next) => {
    try {
        const fuelRecord = await FuelRecord.findById(req.params.id).populate('tripId', 'origin destination status driverId').populate('truckId', 'plateNumber brand model');

        if (!fuelRecord) {
            return res.status(404).json({
                success: false,
                error: 'Fuel record not found',
            });
        }

        res.status(200).json({
            success: true,
            data: fuelRecord,
        });
    } catch (error) {
        next(error);
    }
};

// Get fuel records for a specific trip
// GET /api/trips/:tripId/fuel
exports.getTripFuelRecords = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found',
            });
        }

        const fuelRecords = await FuelRecord.find({ tripId: req.params.tripId }).populate('truckId', 'plateNumber brand model').sort('-date');

        res.status(200).json({
            success: true,
            count: fuelRecords.length,
            data: fuelRecords,
        });
    } catch (error) {
        next(error);
    }
};

// Get fuel records for a specific truck
// GET /api/trucks/:truckId/fuel
exports.getTruckFuelRecords = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.truckId);

        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        const fuelRecords = await FuelRecord.find({ truckId: req.params.truckId }).populate('tripId', 'origin destination status').sort('-date');

        const totalVolume = fuelRecords.reduce((sum, record) => sum + record.volume, 0);
        const totalCost = fuelRecords.reduce((sum, record) => sum + record.cost, 0);

        res.status(200).json({
            success: true,
            count: fuelRecords.length,
            summary: {
                totalVolume,
                totalCost,
                averageCostPerLiter: totalVolume > 0 ? (totalCost / totalVolume).toFixed(2) : 0,
            },
            data: fuelRecords,
        });
    } catch (error) {
        next(error);
    }
};

// Create new fuel record
// POST /api/fuel
exports.createFuelRecord = async (req, res, next) => {
    try {
        const { tripId, truckId, volume, pricePerLiter } = req.body;

        if (tripId) {
            const trip = await Trip.findById(tripId);
            if (!trip) {
                return res.status(404).json({
                    success: false,
                    error: 'Trip not found',
                });
            }

            if (trip.truckId.toString() !== truckId) {
                return res.status(400).json({
                    success: false,
                    error: 'Truck does not match the trip',
                });
            }
        }

        const truck = await Truck.findById(truckId);
        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        // Calculate total cost
        const cost = (volume && pricePerLiter) ? (volume * pricePerLiter) : 0;

        // Remove cost from body to avoid overwriting calculated value
        const { cost: bodyCost, ...bodyData } = req.body;

        const fuelRecord = await FuelRecord.create({
            ...bodyData,
            cost,
        });

        res.status(201).json({
            success: true,
            data: fuelRecord,
        });
    } catch (error) {
        next(error);
    }
};

// Update fuel record
// PUT /api/fuel/:id
exports.updateFuelRecord = async (req, res, next) => {
    try {
        let fuelRecord = await FuelRecord.findById(req.params.id);

        if (!fuelRecord) {
            return res.status(404).json({
                success: false,
                error: 'Fuel record not found',
            });
        }

        // Update fields
        const fieldsToUpdate = ['truckId', 'tripId', 'date', 'volume', 'pricePerLiter', 'station', 'mileage'];
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                fuelRecord[field] = req.body[field];
            }
        });

        // Recalculate cost
        if (fuelRecord.volume && fuelRecord.pricePerLiter) {
            fuelRecord.cost = fuelRecord.volume * fuelRecord.pricePerLiter;
        }

        await fuelRecord.save();

        res.status(200).json({
            success: true,
            data: fuelRecord,
        });
    } catch (error) {
        next(error);
    }
};

// Delete fuel record
// DELETE /api/fuel/:id
exports.deleteFuelRecord = async (req, res, next) => {
    try {
        const fuelRecord = await FuelRecord.findById(req.params.id);

        if (!fuelRecord) {
            return res.status(404).json({
                success: false,
                error: 'Fuel record not found',
            });
        }

        await fuelRecord.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// Get fuel consumption report
// GET /api/fuel/reports/consumption
exports.getFuelConsumptionReport = async (req, res, next) => {
    try {
        const { startDate, endDate, truckId } = req.query;

        let filter = {};
        if (truckId) filter.truckId = truckId;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const fuelRecords = await FuelRecord.find(filter).populate('truckId', 'plateNumber brand model').populate('tripId', 'origin destination distance');

        // Calculate summary
        const totalVolume = fuelRecords.reduce((sum, record) => sum + record.volume, 0);
        const totalCost = fuelRecords.reduce((sum, record) => sum + record.cost, 0);
        const totalDistance = fuelRecords.reduce((sum, record) => {
            return sum + (record.tripId?.distance || 0);
        }, 0);

        // Group by truck
        const byTruck = {};
        fuelRecords.forEach((record) => {
            const truckId = record.truckId._id.toString();
            if (!byTruck[truckId]) {
                byTruck[truckId] = {
                    truck: record.truckId,
                    totalVolume: 0,
                    totalCost: 0,
                    recordCount: 0,
                };
            }
            byTruck[truckId].totalVolume += record.volume;
            byTruck[truckId].totalCost += record.cost;
            byTruck[truckId].recordCount += 1;
        });

        res.status(200).json({
            success: true,
            summary: {
                totalVolume: totalVolume.toFixed(2),
                totalCost: totalCost.toFixed(2),
                totalDistance: totalDistance.toFixed(2),
                averageCostPerLiter: totalVolume > 0 ? (totalCost / totalVolume).toFixed(2) : 0,
                averageConsumptionPer100km: totalDistance > 0 ? ((totalVolume / totalDistance) * 100).toFixed(2) : 0,
                recordCount: fuelRecords.length,
            },
            byTruck: Object.values(byTruck),
        });
    } catch (error) {
        next(error);
    }
};