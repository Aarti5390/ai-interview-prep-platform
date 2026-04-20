require("dotenv").config();
const answerRoutes = require("./routes/answerRoutes.js");   // <-- use require
const interviewRoutes = require("./routes/interviewRoutes");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
app.use("/api/answers", answerRoutes);
app.use("/api/interview", interviewRoutes);

// Connect Database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("Groq key:", process.env.GROQ_API_KEY);