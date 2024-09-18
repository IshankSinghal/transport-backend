const express = require("express");
const { signup, signin, login } = require("../controller/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

module.exports = router;
