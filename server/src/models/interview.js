const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    default: ""
  },
  score: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ""
  },
  strengths: { type: String, default: "" },
  weaknesses: { type: String, default: "" },
  suggestions: { type: String, default: "" }
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: String // keep simple for now
  },
  category: String,
  difficulty: String,

  questions: [questionSchema],

  currentQuestionIndex: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress"
  }

}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);