const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema(
  {
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      default: null,
    },
    trailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trailer',
      default: null,
    },
    type: {
      type: String,
      required: [true, 'Maintenance type is required'],
      enum: ['tire_change', 'oil_change', 'service', 'repair'],
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    mileageAtMaintenance: {
      type: Number,
      default: null,
      min: [0, 'Mileage cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed'],
      default: 'pending',
    },
    intervalKm: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Custom validation for truckId/trailerId relationship
maintenanceRecordSchema.path('truckId').validate(function(value) {
  // If both are set, it's invalid
  if (value && this.trailerId) {
    throw new Error('Maintenance cannot be for both truck and trailer');
  }
  
  if (!value && !this.trailerId) {
    throw new Error('Maintenance must be for either truck or trailer');
  }
  return true;
});

maintenanceRecordSchema.path('trailerId').validate(function(value) {
  // If both are set, it's invalid
  if (value && this.truckId) {
    throw new Error('Maintenance cannot be for both truck and trailer');
  }

  return true;
});

maintenanceRecordSchema.index({ truckId: 1, status: 1 });
maintenanceRecordSchema.index({ trailerId: 1, status: 1 });
maintenanceRecordSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);