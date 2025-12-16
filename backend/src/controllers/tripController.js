const Trip = require('../models/Trip');
const User = require('../models/User');
const Truck = require('../models/Truck');
const Trailer = require('../models/Trailer');
const path = require('path');
const fs = require('fs');
const { generateTripPDF } = require('../utils/pdfGenerator');

// Get all trips
// GET /api/trips
exports.getTrips = async (req, res, next) => {
    try {
        const { status, driverId, startDate, endDate } = req.query;

        let filter = {};

        // If user is driver, only show their trips
        if (req.user.role === 'driver') {
            filter.driverId = req.user._id;
        } else if (driverId) {
            filter.driverId = driverId;
        }

        if (status) filter.status = status;

        // Date range filter
        if (startDate || endDate) {
            filter.departureDate = {};
            if (startDate) filter.departureDate.$gte = new Date(startDate);
            if (endDate) filter.departureDate.$lte = new Date(endDate);
        }

        const trips = await Trip.find(filter)
            .populate('driverId', 'name email phone').populate('truckId', 'plateNumber brand model status')
            .populate('trailerId', 'plateNumber capacity status').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: trips.length,
            data: trips,
        });
    } catch (error) {
        next(error);
    }
};

// Get single trip
// GET /api/trips/:id
exports.getTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('driverId', 'name email phone').populate('truckId', 'plateNumber brand model mileage')
            .populate('trailerId', 'plateNumber capacity mileage');

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found',
            });
        }

        // Drivers can only view their own trips
        if (req.user.role === 'driver' && trip.driverId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this trip',
            });
        }

        res.status(200).json({
            success: true,
            data: trip,
        });
    } catch (error) {
        next(error);
    }
};

// Create new trip
// POST /api/trips
exports.createTrip = async (req, res, next) => {
    try {
        const { driverId, truckId, trailerId } = req.body;

        // Validate driver exists and has driver role
        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                error: 'Driver not found',
            });
        }

        if (driver.role !== 'driver') {
            return res.status(400).json({
                success: false,
                error: 'User is not a driver',
            });
        }

        // Validate truck exists and is available
        const truck = await Truck.findById(truckId);
        if (!truck) {
            return res.status(404).json({
                success: false,
                error: 'Truck not found',
            });
        }

        if (truck.status !== 'available') {
            return res.status(400).json({
                success: false,
                error: `Truck is not available (current status: ${truck.status})`,
            });
        }

        // Validate trailer if provided
        if (trailerId) {
            const trailer = await Trailer.findById(trailerId);
            if (!trailer) {
                return res.status(404).json({
                    success: false,
                    error: 'Trailer not found',
                });
            }
            if (trailer.status !== 'available') {
                return res.status(400).json({
                    success: false,
                    error: `Trailer is not available (current status: ${trailer.status})`,
                });
            }
        }

        // Create trip
        const trip = await Trip.create(req.body);

        // Update truck status to in_use
        truck.status = 'in_use';
        await truck.save();

        // Update trailer status if exists
        if (trailerId) {
            const trailer = await Trailer.findById(trailerId);
            trailer.status = 'in_use';
            await trailer.save();
        }

        // Populate and return
        await trip.populate('driverId', 'name email phone');
        await trip.populate('truckId', 'plateNumber brand model');
        if (trailerId) {
            await trip.populate('trailerId', 'plateNumber capacity');
        }

        res.status(201).json({
            success: true,
            data: trip,
        });
    } catch (error) {
        next(error);
    }
};

// Update trip
// PUT /api/trips/:id
exports.updateTrip = async (req, res, next) => {
    try {
        let trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found',
            });
        }

        // Don't allow updating completed trips
        if (trip.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update completed trip',
            });
        }

        trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
            .populate('driverId', 'name email phone')
            .populate('truckId', 'plateNumber brand model')
            .populate('trailerId', 'plateNumber capacity');

        res.status(200).json({
            success: true,
            data: trip,
        });
    } catch (error) {
        next(error);
    }
};

// Update trip status
// PATCH /api/trips/:id/status
exports.updateTripStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status || !['to_do', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid status: to_do, in_progress, or completed',
            });
        }

        let trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found',
            });
        }

        // Drivers can only update their own trips
        if (req.user.role === 'driver' && trip.driverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this trip',
            });
        }

        // Validate status transition
        const validTransitions = {
            to_do: ['in_progress'],
            in_progress: ['completed'],
            completed: [], // Cannot change from completed
        };

        if (!validTransitions[trip.status].includes(status) && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                error: `Cannot transition from ${trip.status} to ${status}`,
            });
        }

        // Update status
        trip.status = status;

        // Set departure date when starting
        if (status === 'in_progress' && !trip.departureDate) {
            trip.departureDate = new Date();
        }

        // Set arrival date when completing
        if (status === 'completed') {
            trip.arrivalDate = new Date();

            // Update truck and trailer status back to available
            const truck = await Truck.findById(trip.truckId);
            if (truck) {
                truck.status = 'available';
                await truck.save();
            }

            if (trip.trailerId) {
                const trailer = await Trailer.findById(trip.trailerId);
                if (trailer) {
                    trailer.status = 'available';
                    await trailer.save();
                }
            }
        }

        await trip.save();

        await trip.populate('driverId', 'name email phone');
        await trip.populate('truckId', 'plateNumber brand model');
        if (trip.trailerId) {
            await trip.populate('trailerId', 'plateNumber capacity');
        }

        res.status(200).json({
            success: true,
            data: trip,
        });
    } catch (error) {
        next(error);
    }
};

// Update trip mileage
// PATCH /api/trips/:id/mileage
exports.updateTripMileage = async (req, res, next) => {
    try {
        const { mileageStart, mileageEnd, dieselVolume, notes } = req.body;

        let trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found',
            });
        }

        // Drivers can only update their own trips
        if (req.user.role === 'driver' && trip.driverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this trip',
            });
        }

        // Validate mileage
        if (mileageStart !== undefined && mileageStart < 0) {
            return res.status(400).json({
                success: false,
                error: 'Mileage cannot be negative',
            });
        }

        if (mileageEnd !== undefined && mileageStart !== undefined && mileageEnd < mileageStart) {
            return res.status(400).json({
                success: false,
                error: 'End mileage cannot be less than start mileage',
            });
        }

        // Update trip
        if (mileageStart !== undefined) trip.mileageStart = mileageStart;
        if (mileageEnd !== undefined) trip.mileageEnd = mileageEnd;
        if (dieselVolume !== undefined) trip.dieselVolume = dieselVolume;
        if (notes !== undefined) trip.notes = notes;

        await trip.save();

        // Update truck mileage if trip is completed
        if (trip.status === 'completed' && mileageEnd) {
            const truck = await Truck.findById(trip.truckId);
            if (truck && mileageEnd > truck.mileage) {
                truck.mileage = mileageEnd;
                await truck.save();
            }

            // Update trailer mileage if exists
            if (trip.trailerId) {
                const trailer = await Trailer.findById(trip.trailerId);
                if (trailer && mileageEnd > trailer.mileage) {
                    trailer.mileage = mileageEnd;
                    await trailer.save();
                }
            }
        }

        await trip.populate('driverId', 'name email phone');
        await trip.populate('truckId', 'plateNumber brand model mileage');
        if (trip.trailerId) {
            await trip.populate('trailerId', 'plateNumber capacity mileage');
        }

        res.status(200).json({
            success: true,
            data: trip,
        });
    } catch (error) {
        next(error);
    }
};

// Delete trip
// DELETE /api/trips/:id
exports.deleteTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found',
            });
        }

        // Cannot delete completed trips
        if (trip.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete completed trip',
            });
        }

        // Update truck status back to available
        const truck = await Truck.findById(trip.truckId);
        if (truck && truck.status === 'in_use') {
            truck.status = 'available';
            await truck.save();
        }

        // Update trailer status if exists
        if (trip.trailerId) {
            const trailer = await Trailer.findById(trip.trailerId);
            if (trailer && trailer.status === 'in_use') {
                trailer.status = 'available';
                await trailer.save();
            }
        }

        await trip.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

// Get driver's assigned trips
// GET /api/trips/my-trips
exports.getMyTrips = async (req, res, next) => {
    try {
        const trips = await Trip.find({ driverId: req.user._id }).populate('truckId', 'plateNumber brand model').populate('trailerId', 'plateNumber capacity').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: trips.length,
            data: trips,
        });
    } catch (error) {
        next(error);
    }
};

// Download trip as PDF
// GET /api/trips/:id/pdf
exports.downloadTripPDF = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id).populate('driverId', 'name email phone').populate('truckId', 'plateNumber brand model mileage').populate('trailerId', 'plateNumber capacity mileage');

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found',
            });
        }

        // Drivers can only download their own trips
        if (req.user.role === 'driver' && trip.driverId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to download this trip',
            });
        }

        // Create pdfs directory if it doesn't exist
        const pdfDir = path.join(__dirname, '../../pdfs');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        // Generate PDF
        const filename = `trip_${trip._id}_${Date.now()}.pdf`;
        const filepath = path.join(pdfDir, filename);

        await generateTripPDF(trip, filepath);

        // Send file
        res.download(filepath, `Mission_Order_${trip._id}.pdf`, (err) => {
            if (err) {
                console.error('Download error:', err);
            }

            // Delete file after download
            fs.unlink(filepath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting PDF:', unlinkErr);
            });
        });
    } catch (error) {
        next(error);
    }
};
