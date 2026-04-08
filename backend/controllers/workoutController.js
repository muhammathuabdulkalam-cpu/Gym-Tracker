const WorkoutData = require('../models/WorkoutData');

// Get all workout history for user
exports.getAllWorkouts = async (req, res) => {
  try {
    const workouts = await WorkoutData.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add or update workout
exports.saveWorkout = async (req, res) => {
  try {
    const { date, splitDayName, exercises } = req.body;
    let workout = await WorkoutData.findOne({ user: req.user.id, date, splitDayName });

    if (workout) {
      workout.exercises = exercises || workout.exercises;
      await workout.save();
    } else {
      workout = await WorkoutData.create({ user: req.user.id, date, splitDayName, exercises });
    }
    
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
