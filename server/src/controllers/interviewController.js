const Interview = require("../models/interview");
const Question = require("../models/Question");
const { evaluateAnswer } = require("../services/aiService");


// START INTERVIEW
exports.startInterview = async (req, res) => {

try {

    const userId = req.user.id;

    const questions = await Question.aggregate([
        { $sample: { size: 5 } }
    ]);

    const interview = new Interview({
        user: userId,
        questions: questions.map(q => ({
            question: q._id
        }))
    });

    await interview.save();

    res.json({
        message: "Interview started successfully",
        interviewId: interview._id
    });

} catch (error) {

    res.status(500).json({
        message: "Failed to start interview",
        error: error.message
    });

}
};



// GET CURRENT QUESTION
exports.getCurrentQuestion = async (req, res) => {

try {

    const interview = await Interview.findById(req.params.id)
        .populate("questions.question");

    if (!interview) {
        return res.status(404).json({
            message: "Interview not found"
        });
    }

    const index = interview.currentQuestionIndex;

    if (index >= interview.questions.length) {

        return res.json({
            message: "Interview completed"
        });

    }

    const currentQuestion = interview.questions[index].question;

    res.json({
        question: currentQuestion
    });

} catch (error) {

    res.status(500).json({
        message: "Error fetching question"
    });

}
};



// SUBMIT ANSWER
exports.submitAnswer = async (req, res) => {

try {

    const { answer } = req.body;

    const interview = await Interview.findById(req.params.id)
        .populate("questions.question");

    if (!interview) {
        return res.status(404).json({
            message: "Interview not found"
        });
    }

    const index = interview.currentQuestionIndex;

    const current = interview.questions[index];

    const questionText = current.question.questionText || current.question.title || "";

    const evaluation = await evaluateAnswer(
        questionText,
        answer
    );

    current.answer = answer;
    current.score = evaluation.score;
    current.feedback = evaluation.feedback;

    interview.currentQuestionIndex += 1;

    if (interview.currentQuestionIndex >= interview.questions.length) {
        interview.status = "completed";
    }

    await interview.save();

    res.json({
        message: "Answer submitted successfully",
        evaluation
    });

} catch (error) {

    res.status(500).json({
        message: "Error submitting answer",
        error: error.message
    });

}
};



// GET INTERVIEW RESULT
exports.getInterviewResult = async (req, res) => {

try {

    const interview = await Interview.findById(req.params.id)
        .populate("questions.question");

    if (!interview) {

        return res.status(404).json({
            message: "Interview not found"
        });

    }

    res.json({
        interview
    });

} catch (error) {

    res.status(500).json({
        message: "Error fetching interview result"
    });

}
};