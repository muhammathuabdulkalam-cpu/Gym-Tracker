const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0  },
  carbs: { type: Number, default: 0 },
});

const foodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  foods: [foodEntrySchema],
  totalCalories: { type: Number, default: 0 },
}, { timestamps: true });

foodLogSchema.index({ user: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('FoodLog', foodLogSchema);
