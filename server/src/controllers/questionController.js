const Question = require("../models/Question");

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
    const questions = await Question.find().populate(
      "createdBy",
      "name email"
    );

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
      return res.status(404).json({ message: "Question not found" });
    }

    await question.deleteOne();

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  deleteQuestion,
};
