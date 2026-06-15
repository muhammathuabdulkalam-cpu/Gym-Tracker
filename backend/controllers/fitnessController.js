const FitnessData = require('../models/FitnessData');

// Get all data
exports.getAllData = async (req, res) => {
  try {
    // Sort chronological relative to the date string, mapping to the specific user globally
    const data = await FitnessData.find({ user: req.user.id }).sort({ date: 1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or update daily data
exports.addOrUpdateData = async (req, res) => {
  try {
    const { date, calories, steps, weight } = req.body;
    let fitnessData = await FitnessData.findOne({ user: req.user.id, date });

    if (fitnessData) {
      // Create if they don't exist, update otherwise for that date
      fitnessData.calories = calories !== undefined ? calories : fitnessData.calories;
      fitnessData.steps = steps !== undefined ? steps : fitnessData.steps;
      fitnessData.weight = weight !== undefined ? weight : fitnessData.weight;
      await fitnessData.save();
    } else {
      fitnessData = new FitnessData({ user: req.user.id, date, calories, steps, weight });
      await fitnessData.save();
    }
    
    res.status(200).json(fitnessData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
