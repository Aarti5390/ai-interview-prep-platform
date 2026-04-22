const Interview = require("../models/interview");
const { evaluateAnswer, generateQuestions } = require("../services/aiService");

// START INTERVIEW
exports.startInterview = async (req, res) => {
  try {
    const { category, difficulty, numQuestions } = req.body;
    const aiQuestions = await generateQuestions({ category, difficulty, numQuestions });
    if (!aiQuestions || aiQuestions.length === 0) {
      throw new Error("No questions generated. Please try again.");
    }
    const formattedQuestions = aiQuestions.map(q => ({
      text: q.question,
      sampleAnswer: q.sampleAnswer || "",
      userAnswer: null,
      score: null,
      feedback: null,
    }));
    const interview = await Interview.create({
      user: req.user.id,
      category,
      difficulty,
      questions: formattedQuestions,
      currentQuestionIndex: 0,
      status: "in-progress",
      startedAt: new Date()
    });
    res.json({ interviewId: interview._id });
  } catch (error) {
    console.error("❌ START INTERVIEW ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT QUESTION
exports.getQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (interview.questions.length === 0) {
      return res.status(500).json({ message: "Interview has no questions" });
    }
    const index = interview.currentQuestionIndex;
    if (index >= interview.questions.length) {
      interview.status = "completed";
      interview.endedAt = new Date();
      await interview.save();
      return res.json({ completed: true });
    }
    const questionObj = interview.questions[index];
    res.json({
      question: questionObj.text,
      currentIndex: index + 1,
      totalQuestions: interview.questions.length
    });
  } catch (error) {
    console.error("❌ GET QUESTION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// SUBMIT ANSWER
exports.submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    const index = interview.currentQuestionIndex;
    if (index >= interview.questions.length) {
      return res.status(400).json({ message: "No more questions" });
    }
    const question = interview.questions[index];
    const result = await evaluateAnswer(question.text, answer);
    const strengths = Array.isArray(result.strengths) ? result.strengths.join(', ') : result.strengths;
    const weaknesses = Array.isArray(result.weaknesses) ? result.weaknesses.join(', ') : result.weaknesses;
    const suggestions = Array.isArray(result.suggestions) ? result.suggestions.join(', ') : result.suggestions;
    question.userAnswer = answer;
    question.score = result.score;
    question.strengths = strengths;
    question.weaknesses = weaknesses;
    question.suggestions = suggestions;
    question.feedback = `Strengths: ${strengths}. Weaknesses: ${weaknesses}. Suggestions: ${suggestions}`;
    interview.currentQuestionIndex += 1;
    await interview.save();
    res.json({ score: result.score, message: "Answer submitted." });
  } catch (error) {
    console.error("❌ SUBMIT ANSWER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET RESULT
exports.getResult = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    const totalQuestions = interview.questions.length;
    const attempted = interview.questions.filter(q => q.userAnswer).length;
    const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = totalQuestions ? Math.round(totalScore / totalQuestions) : 0;
    res.json({
      summary: { totalQuestions, attempted, remaining: totalQuestions - attempted, averageScore },
      questions: interview.questions
    });
  } catch (error) {
    console.error("❌ GET RESULT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET INTERVIEW HISTORY (with pagination)
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const interviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Interview.countDocuments({ user: req.user.id });
    res.json({ interviews, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("❌ GET HISTORY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};