const Answer = require("../models/Answer");
const Question = require("../models/Question");
const { evaluateAnswer } = require("../services/aiService");

// =============================
// Submit Answer (User)
// =============================
const submitAnswer = async (req, res) => {
  try {
    const { questionId, answerText } = req.body;

    // Validate request
    if (!questionId || !answerText) {
      return res.status(400).json({
        message: "Question ID and Answer are required",
      });
    }

    // Check if question exists
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // =============================
    // AI Evaluation (Groq)
    // =============================
    const aiResult = await evaluateAnswer(
      question.question,
      answerText
    );

    // Fallback if AI fails partially
    const score = aiResult?.score || 0;
    const strengths = aiResult?.strengths || "Not provided";
    const weaknesses = aiResult?.weaknesses || "Not provided";
    const suggestions = aiResult?.suggestions || "Not provided";

    // Format readable feedback
    const formattedFeedback = `
Strengths:
${strengths}

Weaknesses:
${weaknesses}

Suggestions:
${suggestions}
`;

    // =============================
    // Save Answer
    // =============================
    const answer = await Answer.create({
      user: req.user.id,
      question: questionId,
      answerText,
      score,
      feedback: formattedFeedback,
    });

    res.status(201).json({
      message: "Answer submitted and evaluated successfully",
      answer,
    });

  } catch (error) {
  console.error("FULL AI ERROR:", error);

  res.status(500).json({
    message: "AI evaluation failed",
    error: error.message
  });
}
};


// =============================
// Get Logged-in User Answers
// =============================
const getMyAnswers = async (req, res) => {
  try {

    const answers = await Answer.find({
      user: req.user.id,
    })
      .populate("question", "question category difficulty")
      .sort({ createdAt: -1 });

    res.status(200).json(answers);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// =============================
// Admin - Get Answers By Question
// =============================
const getAnswersByQuestion = async (req, res) => {
  try {

    const answers = await Answer.find({
      question: req.params.id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(answers);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  submitAnswer,
  getMyAnswers,
  getAnswersByQuestion,
};