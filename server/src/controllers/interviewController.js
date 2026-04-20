const Interview = require("../models/interview");
const Question = require("../models/Question");
const { evaluateAnswer, generateQuestions } = require("../services/aiService");

// START INTERVIEW
exports.startInterview = async (req, res) => {
  try {
    const { category, difficulty, numQuestions } = req.body;

    // Generate questions from AI (returns array of { question, sampleAnswer, ... })
    const aiQuestions = await generateQuestions({ category, difficulty, numQuestions });

    if (!aiQuestions || aiQuestions.length === 0) {
      throw new Error("No questions generated. Please try again.");
    }

    // 🔥 Map AI output to match your Interview schema: rename question -> text
    const formattedQuestions = aiQuestions.map(q => ({
      text: q.question,                 // required by schema
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
      status: "in-progress"
    });

    res.json({ interviewId: interview._id });
  } catch (error) {
    console.error("❌ START INTERVIEW ERROR:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// GET CURRENT QUESTION
exports.getQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const index = interview.currentQuestionIndex;

    if (!interview.questions || index >= interview.questions.length) {
      interview.status = "completed";
      await interview.save();
      return res.json({ completed: true });
    }

    const questionObj = interview.questions[index];
    if (!questionObj) return res.status(500).json({ message: "Question object missing" });

    res.json({ question: questionObj.text });
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
     // 🔥 Check if the question exists
    if (!interview.questions || index >= interview.questions.length) {
      return res.status(400).json({ message: "No more questions or invalid index" });
    }
    const question = interview.questions[index];

    // AI evaluation using the question text
    const result = await evaluateAnswer(question.text, answer);

    // Store the answer and evaluation
    question.userAnswer = answer;
    question.score = result.score;
    question.feedback = result.feedback;
    question.strengths = result.strengths;
    question.weaknesses = result.weaknesses;
    question.suggestions = result.suggestions;

    // Move to next question
    interview.currentQuestionIndex += 1;

    await interview.save();
     question.feedback = `Strengths: ${result.strengths}. Weaknesses: ${result.weaknesses}. Suggestions: ${result.suggestions}`;


    res.json({
      score: result.score,
      message: "Answer submitted. Click Next to continue."
    });
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

    // Basic insights (you can later enhance with AI)
    const strengths = "Good conceptual clarity";
    const weaknesses = "Needs deeper explanations";
    const suggestions = "Practice more real-world questions";

    res.json({
      summary: {
        totalQuestions,
        attempted,
        remaining: totalQuestions - attempted,
        averageScore
      },
      insights: { strengths, weaknesses, suggestions },
      questions: interview.questions
    });
  } catch (error) {
    console.error("❌ GET RESULT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET INTERVIEW HISTORY
exports.getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    console.error("❌ GET HISTORY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};