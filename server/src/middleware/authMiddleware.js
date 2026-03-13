const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) {

    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("TOKEN RECEIVED:", token);
      console.log("JWT SECRET:", process.env.JWT_SECRET);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("DECODED:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      next();

    } catch (error) {
      console.log("JWT ERROR:", error.message);
      return res.status(401).json({
        message: "Not authorized, token failed"
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token"
    });
  }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("User role:", req.user.role);  // ← add this

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Not authorized."
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
