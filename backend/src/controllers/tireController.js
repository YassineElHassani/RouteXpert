const Tire = require('../models/Tire');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');

// Get all tires
// GET /api/tires
exports.getTires = async (req, res, next) => {
    try {
        const { truckId, trailerId, condition } = req.query;

        let filter = {};
        if (truckId) filter.truckId = truckId;
        if (trailerId) filter.trailerId = trailerId;
        if (condition) filter.condition = condition;

        const tires = await Tire.find(filter).populate('truckId', 'plateNumber brand model').populate('trailerId', 'plateNumber capacity').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tires.length,
            data: tires,
        });
    } catch (error) {
        next(error);
    }
};

// Get single tire
// GET /api/tires/:id
exports.getTire = async (req, res, next) => {
    try {
        const tire = await Tire.findById(req.params.id).populate('truckId', 'plateNumber brand model').populate('trailerId', 'plateNumber capacity');

        if (!tire) {
            return res.status(404).json({
                success: false,
                error: 'Tire not found',
            });
        }

        res.status(200).json({
            success: true,
            data: tire,
        });
    } catch (error) {
        next(error);
    }
};

// Get tires for a specific truck
// GET /api/trucks/:truckId/tires
exports.getTruckTires = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.truckId);

        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        const tires = await Tire.find({ truckId: req.params.truckId }).sort('position');

        res.status(200).json({
            success: true,
            count: tires.length,
            data: tires,
        });
    } catch (error) {
        next(error);
    }
};

// Get tires for a specific trailer
// GET /api/trailers/:trailerId/tires
exports.getTrailerTires = async (req, res, next) => {
    try {
        const trailer = await Trailer.findById(req.params.trailerId);

        if (!trailer) {
            return res.status(404).json({
                success: false,
                error: 'Trailer not found',
            });
        }

        const tires = await Tire.find({ trailerId: req.params.trailerId }).sort('position');

        res.status(200).json({
            success: true,
            count: tires.length,
            data: tires,
        });
    } catch (error) {
        next(error);
    }
};

// Create new tire
// POST /api/tires
exports.createTire = async (req, res, next) => {
    try {
        const { truckId, trailerId } = req.body;

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

        const tire = await Tire.create(req.body);

        res.status(201).json({
            success: true,
            data: tire,
        });
    } catch (error) {
        next(error);
    }
};

// Update tire
// PUT /api/tires/:id
exports.updateTire = async (req, res, next) => {
    try {
        const tire = await Tire.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!tire) {
            return res.status(404).json({
                success: false,
                error: 'Tire not found',
            });
        }

        res.status(200).json({
            success: true,
            data: tire,
        });
    } catch (error) {
        next(error);
    }
};



// Update tire condition
// PATCH /api/tires/:id/condition
exports.updateTireCondition = async (req, res, next) => {
    try {
        const { condition } = req.body;

        if (!condition || !['good', 'worn', 'needs_replacement'].includes(condition)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid condition: good, worn, or needs_replacement',
            });
        }

        const tire = await Tire.findById(req.params.id);

        if (!tire) {
            return res.status(404).json({
                success: false,
                error: 'Tire not found',
            });
        }

        tire.condition = condition;
        await tire.save();

        res.status(200).json({
            success: true,
            data: tire,
        });
    } catch (error) {
        next(error);
    }
};

// Delete tire
// DELETE /api/tires/:id
exports.deleteTire = async (req, res, next) => {
    try {
        const tire = await Tire.findById(req.params.id);

        if (!tire) {
            return res.status(404).json({
                success: false,
                error: 'Tire not found',
            });
        }

        await tire.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// Get tires needing replacement
// GET /api/tires/alerts/replacement
exports.getTiresNeedingReplacement = async (req, res, next) => {
    try {
        const tires = await Tire.find({ condition: 'needs_replacement' }).populate('truckId', 'plateNumber brand model').populate('trailerId', 'plateNumber capacity').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tires.length,
            data: tires,
        });
    } catch (error) {
        next(error);
    }
};