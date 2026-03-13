const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    questions: [
        {
            question: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            },

            answer: {
                type: String
            },

            score: {
                type: Number
            },

            feedback: {
                type: String
            }
        }
    ],

    status: {
        type: String,
        enum: ["ongoing", "completed"],
        default: "ongoing"
    },

    currentQuestionIndex: {
        type: Number,
        default: 0
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);