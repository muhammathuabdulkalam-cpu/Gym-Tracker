const CustomFood = require('../models/CustomFood');

// Get all custom foods for the current user
exports.getCustomFoods = async (req, res) => {
  try {
    const foods = await CustomFood.find({ user: req.user.id }).sort({ name: 1 });
    res.json(foods);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Save a new custom food (or update existing by name)
exports.saveCustomFood = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, defaultUnit } = req.body;
    if (!name || calories === undefined) {
      return res.status(400).json({ message: 'name and calories are required' });
    }
    // Upsert: if the same user already has a food with this name, update it
    const food = await CustomFood.findOneAndUpdate(
      { user: req.user.id, name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { calories, protein: protein || 0, carbs: carbs || 0, fat: fat || 0, defaultUnit: defaultUnit || 'Grams' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    // Set the user field on insert
    if (!food.user) { food.user = req.user.id; await food.save(); }
    res.status(201).json(food);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete a custom food
exports.deleteCustomFood = async (req, res) => {
  try {
    await CustomFood.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
