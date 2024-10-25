const express = require("express");
const { signup, signin, login } = require("../controller/authController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const loginLimiter = require("../middleware/limiter");

const router = express.Router();

router.post("/signup", adminMiddleware, signup);
//add limiter

router.post("/signin", signin);

module.exports = router;
