const express = require('express');
const router = express.Router();
const { getFoodLogs, saveFoodLog, deleteFoodLog } = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getFoodLogs);
router.post('/', saveFoodLog);
router.delete('/:id', deleteFoodLog);

module.exports = router;
