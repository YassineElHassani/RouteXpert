const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip is required'],
    },
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: [true, 'Truck is required'],
    },
    volume: {
      type: Number,
      required: [true, 'Volume is required'],
      min: [0, 'Volume cannot be negative'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

fuelRecordSchema.index({ tripId: 1 });
fuelRecordSchema.index({ truckId: 1 });
fuelRecordSchema.index({ date: -1 });

module.exports = mongoose.model('FuelRecord', fuelRecordSchema);