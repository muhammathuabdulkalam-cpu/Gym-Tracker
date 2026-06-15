const mongoose = require('mongoose');

const fitnessDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    default: 0,
  },
  steps: {
    type: Number,
    default: 0,
  },
  weight: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Enforce unique metrics globally per user per day 
fitnessDataSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FitnessData', fitnessDataSchema);
