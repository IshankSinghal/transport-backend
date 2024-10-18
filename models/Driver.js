const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require("./Counter"); // Import the Counter model for driverId

const driverSchema = new Schema(
  {
    driverId: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    experience: {
      type: Number,
    },
    availabilityStatus: {
      type: String,
      enum: ["Available", "Not Available"],
      default: "Available",
    },
    assignedTruck: {
      type: Number, // ObjectId reference to Truck model
      ref: "Truck",
    },
  },
  { timestamps: true },
);

// Pre-save hook to auto-increment driverId
driverSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Get the next sequence value for driverId
      const counter = await Counter.findByIdAndUpdate(
        { _id: "driverId" },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }, // Create counter if it doesn't exist
      );
      this.driverId = counter.sequence; // Assign the incremented driverId
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;
