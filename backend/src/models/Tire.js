const mongoose = require('mongoose');

const tireSchema = new mongoose.Schema(
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
    position: {
      type: String,
      required: [true, 'Tire position is required'],
      enum: ['front_left', 'front_right', 'rear_left_outer', 'rear_left_inner', 'rear_right_outer', 'rear_right_inner', 'spare'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    installDate: {
      type: Date,
      default: Date.now,
    },
    condition: {
      type: String,
      enum: ['good', 'worn', 'needs_replacement'],
      default: 'good',
    },
    mileageAtInstall: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Tire must belong to either truck or trailer, not both
tireSchema.pre('save', function (next) {
  if (this.truckId && this.trailerId) {
    next(new Error('Tire cannot belong to both truck and trailer'));
  }
  if (!this.truckId && !this.trailerId) {
    next(new Error('Tire must belong to either truck or trailer'));
  }
  next();
});

tireSchema.index({ truckId: 1 });
tireSchema.index({ trailerId: 1 });

module.exports = mongoose.model('Tire', tireSchema);