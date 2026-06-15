const FoodLog = require('../models/FoodLog');

// Get all food logs for the authenticated user, optional ?date=YYYY-MM-DD filter
exports.getFoodLogs = async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.date) filter.date = req.query.date;
    const logs = await FoodLog.find(filter).sort({ date: -1, mealType: 1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Upsert a meal log (create or replace by user+date+mealType)
exports.saveFoodLog = async (req, res) => {
  try {
    const { date, mealType, foods } = req.body;
    const totalCalories = foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);

    const log = await FoodLog.findOneAndUpdate(
      { user: req.user.id, date, mealType },
      { foods, totalCalories },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete a food log entry
exports.deleteFoodLog = async (req, res) => {
  try {
    await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
