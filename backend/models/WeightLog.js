const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  weight: { type: Number, required: true }, // kg
}, { timestamps: true });

weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WeightLog', weightLogSchema);
