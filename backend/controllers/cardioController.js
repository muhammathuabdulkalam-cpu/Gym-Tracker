const CardioLog = require('../models/CardioLog');

// Get cardio logs for user, optional date filter
exports.getCardioLogs = async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.date) filter.date = req.query.date;
    const logs = await CardioLog.find(filter).sort({ date: -1 }).limit(90);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Save a new cardio session
exports.saveCardioLog = async (req, res) => {
  try {
    const { date, activity, durationMinutes, caloriesBurned, steps, distance } = req.body;
    const log = await CardioLog.create({
      user: req.user.id, date, activity, durationMinutes, caloriesBurned,
      steps: steps || 0, distance: distance || 0
    });
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete a cardio session
exports.deleteCardioLog = async (req, res) => {
  try {
    await CardioLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
