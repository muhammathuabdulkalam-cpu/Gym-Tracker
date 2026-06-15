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
    const { date, mealType, foods, foodName, calories, protein, carbs } = req.body;

    if (foods && Array.isArray(foods)) {
      // Web client: replace the entire foods array
      const totalCalories = foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
      const log = await FoodLog.findOneAndUpdate(
        { user: req.user.id, date, mealType },
        { foods, totalCalories },
        { upsert: true, new: true, runValidators: true }
      );
      return res.json(log);
    } else if (foodName) {
      // Mobile client: add or update a single food item in the foods array
      let log = await FoodLog.findOne({ user: req.user.id, date, mealType });

      const newFoodItem = {
        name: foodName,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        quantity: Number(req.body.quantity) || 1,
        unit: req.body.unit || 'Grams'
      };

      if (!log) {
        log = new FoodLog({
          user: req.user.id,
          date,
          mealType,
          foods: [newFoodItem],
          totalCalories: newFoodItem.calories
        });
      } else {
        const foodId = req.body._id;
        if (foodId) {
          const item = log.foods.id(foodId);
          if (item) {
            item.name = foodName;
            item.calories = newFoodItem.calories;
            item.protein = newFoodItem.protein;
            item.carbs = newFoodItem.carbs;
            item.quantity = newFoodItem.quantity;
            item.unit = newFoodItem.unit;
          } else {
            log.foods.push(newFoodItem);
          }
        } else {
          log.foods.push(newFoodItem);
        }
        log.totalCalories = log.foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
      }

      await log.save();
      return res.json(log);
    } else {
      return res.status(400).json({ message: 'Invalid payload. Provide "foods" array or "foodName".' });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete a food log entry (whole log)
exports.deleteFoodLog = async (req, res) => {
  try {
    await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete a specific food item from inside a meal log (mobile support)
exports.deleteFoodItem = async (req, res) => {
  try {
    const { date, mealType, foodId } = req.params;
    const log = await FoodLog.findOne({ user: req.user.id, date, mealType });
    if (!log) {
      return res.status(404).json({ message: 'Food log not found.' });
    }

    log.foods.pull({ _id: foodId });
    log.totalCalories = log.foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);

    if (log.foods.length === 0) {
      await FoodLog.findByIdAndDelete(log._id);
      return res.json({ message: 'Deleted and log removed' });
    } else {
      await log.save();
      return res.json(log);
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
};
