const User = require("../models/user");
const Interview = require("../models/interview");
const { Parser } = require("json2csv");

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await User.countDocuments();

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all interviews with pagination and filters
exports.getAllInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    if (req.query.email) {
      const user = await User.findOne({ email: req.query.email });
      if (user) filter.user = user._id;
      else return res.json({ interviews: [], total: 0, page, pages: 0 });
    }
    if (req.query.status) filter.status = req.query.status;

    const interviews = await Interview.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Interview.countDocuments(filter);

    res.json({
      interviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get all interviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get platform statistics (no pagination needed)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: "completed" });

    const interviews = await Interview.find({ status: "completed" });
    let totalScoreSum = 0;
    let totalQuestionsCount = 0;
    interviews.forEach(interview => {
      interview.questions.forEach(q => {
        if (q.score) {
          totalScoreSum += q.score;
          totalQuestionsCount++;
        }
      });
    });
    const averageScore = totalQuestionsCount ? Math.round(totalScoreSum / totalQuestionsCount) : 0;

    res.json({
      totalUsers,
      totalInterviews,
      completedInterviews,
      averageScore,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export users as CSV (no pagination, export all)
exports.exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const fields = ["name", "email", "role", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(users);
    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    res.send(csv);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({ message: "Failed to export users" });
  }
};