// routes/shipmentRoutes.js

const express = require("express");
const router = express.Router();
const {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
} = require("../controller/shipmentController"); // Adjust the path as needed
const { authMiddleware } = require("../middleware/authMiddleware");

// Create a new shipment
router.post("/", createShipment);

//Get All Shipments
router.get("/", getAllShipments);

//Get A Shipment by Id
router.get("/:shipmentId", getShipmentById);

//To Updata A Shipment
router.put("/:shipmentId", updateShipment);

//To Delete A SHipment
router.delete("/:shipmentId", deleteShipment);

module.exports = router;
