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
    interviewController.getQuestion
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
    interviewController.getResult
);
router.get(
    "/history",
    protect,
    interviewController.getHistory
);
router.delete("/:id", protect, interviewController.deleteInterview);

module.exports = router;