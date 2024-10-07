const mongoose = require("mongoose");
const Counter = require("./Counter"); // Adjust the path as needed

const driverSchema = new mongoose.Schema({
  driverId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  availabilityStatus: {
    type: String,
    enum: ["Available", "Not Available"],
    default: "Available",
  },
  assignedTruck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Truck", // Reference to the Truck model
    required: false, // Optional, in case a driver is not assigned to a truck
  },
  salary: {
    type: Number,
    required: true,
    min: 0, // Ensures salary is a non-negative number
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-increment driverId
driverSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "driverId" }, // Use a static identifier
        { $inc: { sequence: 1 } }, // Increment the sequence
        { new: true, upsert: true }, // Create if it doesn't exist
      );

      this.driverId = counter.sequence; // Set the driverId to the new value
    } catch (error) {
      return next(error); // Pass any errors to the next middleware
    }
  }
  next();
});

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
