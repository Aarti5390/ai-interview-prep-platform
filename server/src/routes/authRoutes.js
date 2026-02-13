const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Profile accessed successfully',
    user: req.user
  });
});

// Admin only route
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

module.exports = router;
