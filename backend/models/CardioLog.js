const mongoose = require('mongoose');

// Each cardio session is one document
const cardioLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  activity: { type: String, required: true }, // e.g. Walking, Running, Cycling
  durationMinutes: { type: Number, required: true },
  caloriesBurned: { type: Number, required: true },
  steps: { type: Number, default: 0 },
  distance: { type: Number, default: 0 }, // km
}, { timestamps: true });

module.exports = mongoose.model('CardioLog', cardioLogSchema);
