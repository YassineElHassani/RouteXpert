const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1990, 'Year must be valid'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in future'],
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
    status: {
      type: String,
      enum: ['available', 'in_use', 'maintenance'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
truckSchema.index({ plateNumber: 1 });
truckSchema.index({ status: 1 });

module.exports = mongoose.model('Truck', truckSchema);