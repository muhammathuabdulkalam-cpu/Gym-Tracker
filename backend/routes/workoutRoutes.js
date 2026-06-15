const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, workoutController.getAllWorkouts);
router.post('/', protect, workoutController.saveWorkout);

module.exports = router;
