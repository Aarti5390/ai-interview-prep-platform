const express = require("express");
const router = express.Router();

const {
  submitAnswer,
  getMyAnswers,
  getAnswersByQuestion,
} = require("../controllers/answerController");

const { protect, authorize } = require("../middleware/authMiddleware");

// User submits answer
router.post("/", protect, submitAnswer);

// User sees own answers
router.get("/my", protect, getMyAnswers);

// Admin views answers of a question
router.get("/question/:id", protect, authorize("admin"), getAnswersByQuestion);

module.exports = router;