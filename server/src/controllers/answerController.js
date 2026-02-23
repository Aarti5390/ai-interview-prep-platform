const Answer = require("../models/Answer");
const Question = require("../models/Question");


// Submit Answer
const submitAnswer = async (req, res) => {
  try {
    const { questionId, answerText } = req.body;

    if (!questionId || !answerText) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = await Answer.create({
      user: req.user.id,
      question: questionId,
      answerText,
    });

    res.status(201).json({
      message: "Answer submitted successfully",
      answer,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Logged-in User Answers
const getMyAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ user: req.user.id })
      .populate("question", "question category difficulty")
      .sort({ createdAt: -1 });

    res.status(200).json(answers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Admin — Get answers by question
const getAnswersByQuestion = async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(answers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitAnswer,
  getMyAnswers,
  getAnswersByQuestion,
};