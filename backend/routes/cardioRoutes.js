const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/cardioController');

router.get('/', protect, ctrl.getCardioLogs);
router.post('/', protect, ctrl.saveCardioLog);
router.delete('/:id', protect, ctrl.deleteCardioLog);

module.exports = router;
