const Truck = require('../models/Truck');

// Get all trucks
// GET /api/trucks
exports.getTrucks = async (req, res, next) => {
    try {
        const trucks = await Truck.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count: trucks.length,
            data: trucks,
        });
    } catch (error) {
        next(error);
    }
};

// Get single truck
// GET /api/trucks/:id
exports.getTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.id);

        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        res.status(200).json({
            success: true,
            data: truck,
        });
    } catch (error) {
        next(error);
    }
};

// Create new truck
// POST /api/trucks
exports.createTruck = async (req, res, next) => {
    try {
        const truck = await Truck.create(req.body);

        res.status(201).json({
            success: true,
            data: truck,
        });
    } catch (error) {
        next(error);
    }
};

// Update truck
// PUT /api/trucks/:id
exports.updateTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        res.status(200).json({
            success: true,
            data: truck,
        });
    } catch (error) {
        next(error);
    }
};

// Delete truck
// DELETE /api/trucks/:id
exports.deleteTruck = async (req, res, next) => {
    try {
        const truck = await Truck.findById(req.params.id);

        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        await truck.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// Update truck mileage
// PATCH /api/trucks/:id/mileage
exports.updateTruckMileage = async (req, res, next) => {
    try {
        const { mileage } = req.body;

        if (!mileage || mileage < 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid mileage',
            });
        }

        const truck = await Truck.findById(req.params.id);

        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        if (mileage < truck.mileage) {
            return res.status(400).json({
                success: false,
                error: 'New mileage cannot be less than current mileage',
            });
        }

        truck.mileage = mileage;
        await truck.save();

        res.status(200).json({
            success: true,
            data: truck,
        });
    } catch (error) {
        next(error);
    }
};