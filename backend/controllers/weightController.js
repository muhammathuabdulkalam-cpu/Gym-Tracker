const WeightLog = require('../models/WeightLog');

// Get all weight logs for user (sorted newest first)
exports.getWeightLogs = async (req, res) => {
  try {
    const logs = await WeightLog.find({ user: req.user.id }).sort({ date: -1 }).limit(90);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Log or update today's weight
exports.saveWeightLog = async (req, res) => {
  try {
    const { date, weight } = req.body;
    let log = await WeightLog.findOne({ user: req.user.id, date });
    if (log) {
      log.weight = weight;
      await log.save();
    } else {
      log = await WeightLog.create({ user: req.user.id, date, weight });
    }
    res.status(201).json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete a weight log
exports.deleteWeightLog = async (req, res) => {
  try {
    await WeightLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
