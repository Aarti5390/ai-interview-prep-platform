const express = require("express");
const cors = require("cors");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const interviewRoutes = require("./routes/interviewRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/interview", interviewRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
