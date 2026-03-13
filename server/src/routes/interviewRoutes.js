const express = require("express");

const router = express.Router();

const interviewController = require("../controllers/interviewController");

const { protect } = require("../middleware/authMiddleware");


// START INTERVIEW
router.post(
    "/start",
    protect,
    interviewController.startInterview
);


// GET QUESTION
router.get(
    "/:id/question",
    protect,
    interviewController.getCurrentQuestion
);


// SUBMIT ANSWER
router.post(
    "/:id/answer",
    protect,
    interviewController.submitAnswer
);


// GET RESULT
router.get(
    "/:id/result",
    protect,
    interviewController.getInterviewResult
);


module.exports = router;