const express = require("express");
const { signup, signin, login } = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");
const loginLimiter = require("../middleware/limiter");

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", loginLimiter, signin);

module.exports = router;
