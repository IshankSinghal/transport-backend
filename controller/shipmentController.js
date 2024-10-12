// controllers/shipmentController.js

const Shipment = require("../models/Shipment");
const { body, validationResult } = require("express-validator");

// Create a new shipment
const createShipment = async (req, res) => {
  // Validate request body using express-validator
  await body("clientId")
    .isNumeric()
    .withMessage("Client ID must be an integer.")
    .run(req);
  await body("pickupLocation")
    .isString()
    .notEmpty()
    .withMessage("Pickup location is required.")
    .run(req);
  await body("deliveryLocation")
    .isString()
    .notEmpty()
    .withMessage("Delivery location is required.")
    .run(req);
  await body("cargoType")
    .isString()
    .notEmpty()
    .withMessage("Cargo type is required.")
    .run(req);
  await body("cargoWeight")
    .isFloat({ gt: 0 })
    .withMessage("Cargo weight must be a positive number.")
    .run(req);
  await body("departureDate")
    .isISO8601()
    .toDate()
    .withMessage("Departure date must be a valid date.")
    .run(req);
  await body("arrivalDate")
    .isISO8601()
    .toDate()
    .withMessage("Arrival date must be a valid date.")
    .run(req);
  await body("truckId")
    .optional()
    .isNumeric()
    .withMessage("Truck ID must be a valid MongoDB ObjectId.")
    .run(req);
  await body("driverId")
    .optional()
    .isNumeric()
    .withMessage("Driver ID must be a valid MongoDB ObjectId.")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    clientId,
    pickupLocation,
    deliveryLocation,
    cargoType,
    cargoWeight,
    specialInstructions,
    departureDate,
    arrivalDate,
    status = "pending", // Default to 'pending' if not provided
    truckId,
    driverId,
  } = req.body;

  try {
    const shipment = new Shipment({
      shipmentId: 0,
      clientId,
      pickupLocation,
      deliveryLocation,
      cargoType,
      cargoWeight,
      specialInstructions,
      departureDate,
      arrivalDate,
      status,
      truckId,
      driverId,
    });

    await shipment.save();

    return res.status(201).json({
      message: "Shipment created successfully.",
      shipment,
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get all shipments
const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().populate("truckId driverId").exec();
    return res.status(200).json(shipments);
  } catch (error) {
    console.error("Error retrieving shipments:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get a shipment by ID
const getShipmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const shipment = await Shipment.findById(id)
      .populate("truckId driverId")
      .exec();
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found." });
    }
    return res.status(200).json(shipment);
  } catch (error) {
    console.error("Error retrieving shipment:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Update a shipment
const updateShipment = async (req, res) => {
  const { id } = req.params;

  // Validate request body
  await body("pickupLocation")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Pickup location must be a non-empty string.")
    .run(req);
  await body("deliveryLocation")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Delivery location must be a non-empty string.")
    .run(req);
  await body("cargoType")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Cargo type must be a non-empty string.")
    .run(req);
  await body("cargoWeight")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Cargo weight must be a positive number.")
    .run(req);
  await body("departureDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Departure date must be a valid date.")
    .run(req);
  await body("arrivalDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Arrival date must be a valid date.")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedShipment = await Shipment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("truckId driverId");

    if (!updatedShipment) {
      return res.status(404).json({ error: "Shipment not found." });
    }

    return res.status(200).json({
      message: "Shipment updated successfully.",
      shipment: updatedShipment,
    });
  } catch (error) {
    console.error("Error updating shipment:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Delete a shipment
const deleteShipment = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedShipment = await Shipment.findByIdAndDelete(id);

    if (!deletedShipment) {
      return res.status(404).json({ error: "Shipment not found." });
    }

    return res.status(200).json({
      message: "Shipment deleted successfully.",
      shipment: deletedShipment,
    });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Export all controller functions
module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
};
