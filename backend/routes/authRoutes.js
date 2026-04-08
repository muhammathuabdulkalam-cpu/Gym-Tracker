const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/google', authController.googleLogin);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
