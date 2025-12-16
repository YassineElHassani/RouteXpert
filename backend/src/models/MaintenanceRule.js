const mongoose = require('mongoose');

const maintenanceRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['oil_change', 'tire_rotation', 'brake_inspection', 'filter_replacement', 'general_service', 'other'],
      required: [true, 'Category is required'],
    },
    intervalType: {
      type: String,
      enum: ['mileage', 'time', 'both'],
      required: [true, 'Interval type is required'],
    },
    intervalMileage: {
      type: Number,
      min: [0, 'Mileage interval cannot be negative'],
      required: function() {
        return this.intervalType === 'mileage' || this.intervalType === 'both';
      },
    },
    intervalDays: {
      type: Number,
      min: [0, 'Days interval cannot be negative'],
      required: function() {
        return this.intervalType === 'time' || this.intervalType === 'both';
      },
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },
    estimatedDuration: {
      type: Number, // in hours
      min: [0, 'Duration cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

maintenanceRuleSchema.index({ category: 1 });
maintenanceRuleSchema.index({ isActive: 1 });

module.exports = mongoose.model('MaintenanceRule', maintenanceRuleSchema);
