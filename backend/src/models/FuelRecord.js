const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
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
    pricePerLiter: {
      type: Number,
      required: [true, 'Price per liter is required'],
      min: [0, 'Price cannot be negative'],
    },
    cost: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    station: {
      type: String,
      trim: true,
      required: [true, 'Station is required'],
    },
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
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