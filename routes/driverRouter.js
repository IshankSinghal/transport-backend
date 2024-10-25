const express = require("express");
const {
  createDriver,
  getDriverById,
  updateDriverById,
  deleteDriverById,
  getAllDrivers,
  getAvailableDrivers,
} = require("../controller/driverController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Route to create a new driver
router.post("/", authMiddleware, createDriver);

// Route to get available drivers
router.get("/available", authMiddleware, getAvailableDrivers);

// Route to get a driver by ID
router.get("/:driverId", authMiddleware, getDriverById);

// Route to update a driver by ID
router.put("/:driverId", authMiddleware, updateDriverById);

// Route to delete a driver by ID
router.delete("/:driverId", authMiddleware, deleteDriverById);

// Route to get all drivers
router.get("/", authMiddleware, getAllDrivers);

module.exports = router;
