const express = require('express');
const router = express.Router();
const fitnessController = require('../controllers/fitnessController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, fitnessController.getAllData);
router.post('/', protect, fitnessController.addOrUpdateData);

module.exports = router;
