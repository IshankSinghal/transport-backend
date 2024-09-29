const jwt = require("jsonwebtoken");

// General Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Check for the Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assumes the token contains user information

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token, authorization denied" });
  }
};

// Admin Authorization Middleware
const adminMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Check for the Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    }
    req.user = decoded;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token, authorization denied" });
  }
};
module.exports = {
  authMiddleware,
  adminMiddleware,
};
