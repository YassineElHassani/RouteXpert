const mongoose = require('mongoose');

const trailerSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0, 'Capacity cannot be negative'],
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

trailerSchema.index({ plateNumber: 1 });
trailerSchema.index({ status: 1 });

module.exports = mongoose.model('Trailer', trailerSchema);