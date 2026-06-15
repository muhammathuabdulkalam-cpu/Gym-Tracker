const express = require('express');
const router = express.Router();
const { searchNutrition } = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', searchNutrition);

module.exports = router;
