const Question = require("../models/Question");
const { generateQuestions } = require("../services/aiService");


// CREATE QUESTION (Admin Only)
const createQuestion = async (req, res) => {
  try {
    const { question, category, difficulty } = req.body;

    const newQuestion = await Question.create({
      question,
      category,
      difficulty,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL QUESTIONS (User + Admin)
const getAllQuestions = async (req, res) => {
  try {

    const questions = await Question.find()
      .populate("createdBy", "name email");

    res.status(200).json(questions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE QUESTION (Admin Only)
const deleteQuestion = async (req, res) => {
  try {

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found"
      });
    }

    await question.deleteOne();

    res.json({
      message: "Question deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// AI QUESTION GENERATION
const generateAIQuestions = async (req, res) => {

  try {

    const { topic, difficulty, count } = req.body;

    if (!topic || !difficulty || !count) {
      return res.status(400).json({
        message: "Topic, difficulty and count are required"
      });
    }

    // Call AI service
    const aiResult = await generateQuestions(topic, difficulty, count);

    const savedQuestions = [];

    for (let q of aiResult.questions) {

      const question = await Question.create({
        question: q,
        category: topic,
        difficulty: difficulty,
        createdBy: req.user.id
      });

      savedQuestions.push(question);
    }

    res.status(201).json({
      message: "AI questions generated successfully",
      questions: savedQuestions
    });

  } catch (error) {

    console.error("AI Question Error:", error.message);

    res.status(500).json({
      message: "AI question generation failed",
      error: error.message
    });

  }

};


module.exports = {
  createQuestion,
  getAllQuestions,
  deleteQuestion,
  generateAIQuestions
};