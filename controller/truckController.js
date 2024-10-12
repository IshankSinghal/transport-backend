const Truck = require("../models/Truck"); // Adjust the path as needed
const { body, validationResult, param } = require("express-validator");

// Create a new truck
const createTruck = async (req, res) => {
  // Validate request body using express-validator
  await body("registrationNumber")
    .isString()
    .notEmpty()
    .withMessage("Registration number is required.")
    .run(req);
  await body("model")
    .isString()
    .notEmpty()
    .withMessage("Model is required.")
    .run(req);
  await body("capacity")
    .isFloat({ gt: 0 })
    .withMessage("Capacity must be a positive number.")
    .run(req);
  await body("fuelType")
    .isIn(["Diesel", "Petrol", "Electric"])
    .withMessage("Fuel type must be either Diesel, Petrol, or Electric.")
    .run(req);
  await body("mileage")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Mileage must be a positive number.")
    .run(req);
  await body("lastServicedDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Last serviced date must be a valid date.")
    .run(req);
  await body("availabilityStatus")
    .optional()
    .isIn(["Available", "Not Available", "Maintenance"])
    .withMessage(
      "Availability status must be either Available, Not Available, or Maintenance.",
    )
    .run(req);
  await body("insuranceDetails.policyNumber")
    .isString()
    .notEmpty()
    .withMessage("Insurance policy number is required.")
    .run(req);
  await body("insuranceDetails.expiryDate")
    .isISO8601()
    .toDate()
    .withMessage("Insurance expiry date must be a valid date.")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    registrationNumber,
    model,
    capacity,
    fuelType,
    mileage,
    availabilityStatus,
    lastServicedDate,
    insuranceDetails,
  } = req.body;

  try {
    const truckExist = await Truck.findOne({
      registrationNumber: registrationNumber,
    });
    if (truckExist) {
      return res.status(400).json({
        success: false,
        message: "Truck Exists",
      });
    }
    const truck = new Truck({
      truckId: 0,
      registrationNumber,
      model,
      capacity,
      fuelType,
      mileage,
      availabilityStatus, // Using the updated field name
      lastServicedDate,
      insuranceDetails,
    });

    // Save the truck to the database
    await truck.save();

    return res.status(201).json({
      message: "Truck created successfully.",
      truck,
    });
  } catch (error) {
    console.error("Error creating truck:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

const getAllTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find();
    return res.status(200).json({ trucks });
  } catch (error) {
    console.error("Error fetching trucks:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get a truck by ID
const getTruckById = async (req, res) => {
  await param("truckId")
    .isString()
    .withMessage("Truck ID must be a string.")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { truckId } = req.params;

  try {
    const truck = await Truck.findOne({ truckId });
    if (!truck) {
      return res.status(404).json({ error: "Truck not found." });
    }

    return res.status(200).json({ truck });
  } catch (error) {
    console.error("Error fetching truck:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Update a truck by ID
const updateTruckById = async (req, res) => {
  await param("truckId")
    .isString()
    .withMessage("Truck ID must be a string.")
    .run(req);
  await body("registrationNumber")
    .isString()
    .withMessage("Registration number must be a string.")
    .run(req);
  await body("model")
    .optional()
    .isString()
    .withMessage("Model must be a string.")
    .run(req);
  await body("capacity")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Capacity must be a positive number.")
    .run(req);
  await body("fuelType")
    .optional()
    .isIn(["Diesel", "Petrol", "Electric"])
    .withMessage("Fuel type must be either Diesel, Petrol, or Electric.")
    .run(req);
  await body("mileage")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Mileage must be a positive number.")
    .run(req);
  await body("lastServicedDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Last serviced date must be a valid date.")
    .run(req);
  await body("availabilityStatus")
    .optional()
    .isIn(["Available", "Not Available", "Maintenance"])
    .withMessage(
      "Availability status must be either Available, Not Available, or Maintenance.",
    )
    .run(req);
  await body("insuranceDetails.policyNumber")
    .optional()
    .isString()
    .withMessage("Insurance policy number must be a string.")
    .run(req);
  await body("insuranceDetails.expiryDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Insurance expiry date must be a valid date.")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { truckId } = req.params;
  const updateData = req.body;

  try {
    const truck = await Truck.findOneAndUpdate({ truckId }, updateData, {
      new: true,
    });
    if (!truck) {
      return res.status(404).json({ error: "Truck not found." });
    }

    return res.status(200).json({
      message: "Truck updated successfully.",
      truck,
    });
  } catch (error) {
    console.error("Error updating truck:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Delete a truck by ID
const deleteTruckById = async (req, res) => {
  await param("truckId")
    .isString()
    .withMessage("Truck ID must be a string.")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { truckId } = req.params;

  try {
    const truck = await Truck.findOneAndDelete({ truckId });
    if (!truck) {
      return res.status(404).json({ error: "Truck not found." });
    }

    return res.status(200).json({
      message: "Truck deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting truck:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get all available trucks
const getAvailableTrucks = async (req, res) => {
  try {
    const availableTrucks = await Truck.find({
      availabilityStatus: "Available",
    });
    return res.status(200).json({ availableTrucks });
  } catch (error) {
    console.error("Error fetching available trucks:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get trucks due for maintenance
const getTrucksDueForMaintenance = async (req, res) => {
  try {
    const trucksDueForMaintenance = await Truck.find({
      lastServicedDate: {
        $lte: new Date(new Date() - 1000 * 60 * 60 * 24 * 30 * 6),
      },
      availabilityStatus: "Maintenance",
    });

    return res.status(200).json({ trucksDueForMaintenance });
  } catch (error) {
    console.error("Error fetching trucks due for maintenance:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get trucks by model or capacity
const getTrucksByFilter = async (req, res) => {
  const { model, capacity } = req.query;
  console.log("hitting");
  try {
    const filter = {};
    if (model) filter.model = model;
    if (capacity) filter.capacity = { $gte: capacity };
    console.log(filter);

    const trucks = await Truck.find(filter);

    return res.status(200).json({ trucks });
  } catch (error) {
    console.error("Error fetching trucks by filter:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Export the controller functions

const truckController = {
  createTruck,
  getTruckById,
  updateTruckById,
  deleteTruckById,
  getAllTrucks,
  getAvailableTrucks,
  getTrucksDueForMaintenance,
  getTrucksByFilter,
};

module.exports = truckController;
