const express = require("express");
const router = express.Router();
const truckController = require("../controller/truckController"); // Adjust the path as needed
const { authMiddleware } = require("../middleware/authMiddleware");

// Create a new truck
router.post("/", authMiddleware, truckController.createTruck);

// Get all trucks
router.get("/", authMiddleware, truckController.getAllTrucks);

// Get all available trucks
router.get("/available", authMiddleware, truckController.getAvailableTrucks);

// Get trucks due for maintenance
router.get(
  "/maintenance",
  authMiddleware,
  truckController.getTrucksDueForMaintenance,
);

// Get trucks by model or capacity
router.get("/filter", authMiddleware, truckController.getTrucksByFilter);

// Get a truck by ID
router.get("/:truckId", authMiddleware, truckController.getTruckById);

// Update a truck by ID
router.put("/:truckId", authMiddleware, truckController.updateTruckById);

// Delete a truck by ID
router.delete("/:truckId", authMiddleware, truckController.deleteTruckById);

module.exports = router;
