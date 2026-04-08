const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/weightController');

router.get('/', protect, ctrl.getWeightLogs);
router.post('/', protect, ctrl.saveWeightLog);
router.delete('/:id', protect, ctrl.deleteWeightLog);

module.exports = router;
