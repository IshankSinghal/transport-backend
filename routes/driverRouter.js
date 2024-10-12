const express = require("express");
const {
  createDriver,
  getDriverById,
  updateDriverById,
  deleteDriverById,
  getAllDrivers,
  getAvailableDrivers,
} = require("../controller/driverController");

const router = express.Router();

// Route to create a new driver
router.post("/", createDriver);

// Route to get available drivers
router.get("/available", getAvailableDrivers);

// Route to get a driver by ID
router.get("/:driverId", getDriverById);

// Route to update a driver by ID
router.put("/:driverId", updateDriverById);

// Route to delete a driver by ID
router.delete("/:driverId", deleteDriverById);

// Route to get all drivers
router.get("/", getAllDrivers);

module.exports = router;
