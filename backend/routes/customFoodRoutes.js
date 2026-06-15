const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/customFoodController');

router.get('/',         protect, ctrl.getCustomFoods);
router.post('/',        protect, ctrl.saveCustomFood);
router.delete('/:id',   protect, ctrl.deleteCustomFood);

module.exports = router;
