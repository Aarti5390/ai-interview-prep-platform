const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/user');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile (name, email)
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.json({ user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete account
router.delete('/delete-account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin only route
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

// Legacy profile route (optional)
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Profile accessed successfully',
    user: req.user
  });
});

module.exports = router;