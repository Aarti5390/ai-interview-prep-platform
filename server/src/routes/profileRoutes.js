const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const resumeUrl = `/uploads/${req.file.filename}`;
    const User = require('../models/user');
    const user = await User.findById(req.user.id);
    user.resumeUrl = resumeUrl;
    user.profileCompleted = true;
    await user.save();
    res.json({ resumeUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;