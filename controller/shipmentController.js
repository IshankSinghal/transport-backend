// controllers/shipmentController.js

const Shipment = require("../models/Shipment"); // Adjust the path as needed
const { body, validationResult } = require("express-validator");

// Create a new shipment
const createShipment = async (req, res) => {
  // Validate request body using express-validator
  await body("clientId")
    .isInt()
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
    });

    // Save the shipment to the database
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

// Export the controller functions
module.exports = {
  createShipment,
};
