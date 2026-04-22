const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getAllInterviews,
  getStats,
  exportUsersCSV        // ✅ make sure this is imported
} = require("../controllers/adminController");

router.use(protect);
router.use(authorize("admin"));

router.get("/users", getAllUsers);
router.get("/interviews", getAllInterviews);
router.get("/stats", getStats);
router.get("/export/users", exportUsersCSV);   // ✅ now it's defined

module.exports = router;