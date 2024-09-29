const mongoose = require("mongoose");
const Counter = require("./Counter"); // Adjust the path as needed

// Define the Shipment schema
const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: Number,
      required: true,
      unique: true, // Ensures that the Shipment ID is unique
      index: true, // Creates an index for fast searching
    },
    clientId: {
      type: Number,
      required: true,
      ref: "Client",
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
    },
    cargoType: {
      type: String,
      required: true,
    },
    cargoWeight: {
      type: Number,
      required: true,
    },
    specialInstructions: {
      type: String,
      required: false,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
); // Automatically adds createdAt and updatedAt timestamps

// Pre-save hook to auto-increment shipmentId
shipmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "shipmentId" }, // Use a static identifier
        { $inc: { sequence: 1 } }, // Increment the sequence
        { new: true, upsert: true }, // Create if it doesn't exist
      );

      this.shipmentId = counter.sequence; // Set the shipmentId to the new value
    } catch (error) {
      next(error); // Pass any errors to the next middleware
    }
  }
  next();
});

// Create the Shipment model
const Shipment = mongoose.model("Shipment", shipmentSchema);

module.exports = Shipment;
