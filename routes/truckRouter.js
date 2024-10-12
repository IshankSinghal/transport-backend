const express = require("express");
const router = express.Router();
const truckController = require("../controller/truckController"); // Adjust the path as needed

// Create a new truck
router.post("/", truckController.createTruck);

// Get all trucks
router.get("/", truckController.getAllTrucks);

// Get all available trucks
router.get("/available", truckController.getAvailableTrucks);

// Get trucks due for maintenance
router.get("/maintenance", truckController.getTrucksDueForMaintenance);

// Get trucks by model or capacity
router.get("/filter", truckController.getTrucksByFilter);

// Get a truck by ID
router.get("/:truckId", truckController.getTruckById);

// Update a truck by ID
router.put("/:truckId", truckController.updateTruckById);

// Delete a truck by ID
router.delete("/:truckId", truckController.deleteTruckById);

module.exports = router;
