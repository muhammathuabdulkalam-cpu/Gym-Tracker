const mongoose = require('mongoose');

/**
 * Stores user-defined custom foods globally (not per-day).
 * These appear in search suggestions alongside the built-in database.
 */
const customFoodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  // Nutrition per 100g baseline
  calories: { type: Number, required: true },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  // Optional: the unit most commonly used (g, bowl, cup, plate…)
  defaultUnit: { type: String, default: 'Grams' },
}, { timestamps: true });

// One food name per user (case-insensitive via index)
customFoodSchema.index({ user: 1, name: 1 }, { unique: false });

module.exports = mongoose.model('CustomFood', customFoodSchema);
