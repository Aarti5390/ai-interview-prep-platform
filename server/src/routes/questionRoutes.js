const express = require("express");
const router = express.Router();

const {
  createQuestion,
  getAllQuestions,
  deleteQuestion,
  generateAIQuestions
} = require("../controllers/questionController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Admin creates question
router.post("/", protect, authorize("admin"), createQuestion);

// All users can view questions
router.get("/", protect, getAllQuestions);

// Admin deletes question
router.delete("/:id", protect, authorize("admin"), deleteQuestion);

router.post("/generate", protect, authorize("admin"), generateAIQuestions);

module.exports = router;
