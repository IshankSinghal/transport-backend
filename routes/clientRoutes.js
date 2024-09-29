const express = require("express");
const { createClient } = require("../controller/clientController"); // Adjust the path as needed
const { adminMiddleware } = require("../middleware/authMiddleware");
const clientRouter = express.Router();

// Route to create a new client
clientRouter.post("/clients", adminMiddleware, createClient);

module.exports = clientRouter;
