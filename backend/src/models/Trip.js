const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0, 'Distance cannot be negative'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver is required'],
    },
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: [true, 'Truck is required'],
    },
    trailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trailer',
      default: null,
    },
    status: {
      type: String,
      enum: ['to_do', 'in_progress', 'completed'],
      default: 'to_do',
    },
    departureDate: {
      type: Date,
      default: null,
    },
    arrivalDate: {
      type: Date,
      default: null,
    },
    mileageStart: {
      type: Number,
      default: null,
      min: [0, 'Mileage cannot be negative'],
    },
    mileageEnd: {
      type: Number,
      default: null,
      min: [0, 'Mileage cannot be negative'],
    },
    dieselVolume: {
      type: Number,
      default: null,
      min: [0, 'Diesel volume cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for total mileage
tripSchema.virtual('totalMileage').get(function () {
  if (this.mileageStart && this.mileageEnd) {
    return this.mileageEnd - this.mileageStart;
  }
  return 0;
});

// Indexes
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ truckId: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ departureDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);