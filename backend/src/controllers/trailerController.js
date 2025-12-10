const Trailer = require('../models/Trailer');

// Get all trailers
// GET /api/trailers
exports.getTrailers = async (req, res, next) => {
    try {
        const trailers = await Trailer.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count: trailers.length,
            data: trailers,
        });
    } catch (error) {
        next(error);
    }
};

// Get single trailer
// GET /api/trailers/:id
exports.getTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findById(req.params.id);

        if (!trailer) {
            return res.status(404).json({
                success: false,
                error: 'Trailer not found',
            });
        }

        res.status(200).json({
            success: true,
            data: trailer,
        });
    } catch (error) {
        next(error);
    }
};

// Create new trailer
// POST /api/trailers
exports.createTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.create(req.body);

        res.status(201).json({
            success: true,
            data: trailer,
        });
    } catch (error) {
        next(error);
    }
};

// Update trailer
// PUT /api/trailers/:id
exports.updateTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!trailer) {
            return res.status(404).json({
                success: false,
                error: 'Trailer not found',
            });
        }

        res.status(200).json({
            success: true,
            data: trailer,
        });
    } catch (error) {
        next(error);
    }
};

// Delete trailer
// DELETE /api/trailers/:id
exports.deleteTrailer = async (req, res, next) => {
    try {
        const trailer = await Trailer.findById(req.params.id);

        if (!trailer) {
            return res.status(404).json({
                success: false,
                error: 'Trailer not found',
            });
        }

        await trailer.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};