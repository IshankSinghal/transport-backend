const bcrypt = require("bcryptjs");
const User = require("../models/user");
const generateToken = require("../services/authentication");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

signup = async (req, res) => {
  // Validate input
  console.log("in");
  await body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .run(req);
  await body("email").isEmail().withMessage("Invalid email address").run(req);
  await body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .run(req);
  await body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Invalid role")
    .run(req);

  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid input", errors: errors.array() });
  }

  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // Generate token
    const token = generateToken(newUser._id, role);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Server error during signup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

signin = async (req, res) => {
  // Validate input
  await body("email").isEmail().withMessage("Invalid email address").run(req);
  await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);

  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Invalid input", errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Server error during signin:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { signup, signin };
