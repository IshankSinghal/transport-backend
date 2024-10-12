// routes/shipmentRoutes.js

const express = require("express");
const router = express.Router();
const { createShipment } = require("../controller/shipmentController"); // Adjust the path as needed
const { authMiddleware } = require("../middleware/authMiddleware");

// Create a new shipment
router.post("/create", createShipment);

module.exports = router;
