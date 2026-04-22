const User = require('../models/user');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, qualification, resumeUrl, phone, location } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (qualification) user.qualification = qualification;
    if (resumeUrl) user.resumeUrl = resumeUrl;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    // Mark profile as completed if at least qualification is filled
    if (qualification || phone || location) {
      user.profileCompleted = true;
    }
    await user.save();
    res.json({
      message: 'Profile updated',
      user: {
        name: user.name,
        qualification: user.qualification,
        resumeUrl: user.resumeUrl,
        phone: user.phone,
        location: user.location,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};