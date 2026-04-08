const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true }
});

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: [setSchema] // Replaced static sets/reps/weight with dynamic array of sets
});

const workoutDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  splitDayName: { type: String, required: true },
  exercises: [exerciseSchema]
}, { timestamps: true });

workoutDataSchema.index({ user: 1, date: 1, splitDayName: 1 }, { unique: true });

module.exports = mongoose.model('WorkoutData', workoutDataSchema);
