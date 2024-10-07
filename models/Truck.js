const mongoose = require("mongoose");
const Counter = require("./Counter"); // Adjust the path as needed

// Define the Truck schema
const truckSchema = new mongoose.Schema(
  {
    truckId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    model: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["Diesel", "Petrol", "Electric"],
      required: true,
    },
    mileage: {
      type: Number,
    },
    availabilityStatus: {
      type: String,
      enum: ["Available", "Not Available", "Maintenance"],
      default: "Available",
    },
    lastServicedDate: {
      type: Date,
    },
    insuranceDetails: {
      policyNumber: { type: String },
      expiryDate: { type: Date },
    },
  },
  { timestamps: true },
);
truckSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "truckId" },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true },
      );

      this.truckId = `${counter.sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Create the Truck model
const Truck = mongoose.model("Truck", truckSchema);

module.exports = Truck;
