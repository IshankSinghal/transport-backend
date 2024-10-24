const mongoose = require("mongoose");
const Counter = require("./Counter"); // Adjust the path as needed

const billSchema = new mongoose.Schema(
  {
    billId: {
      type: Number,
      required: true,
      unique: true,
    },
    clientId: {
      type: Number,
      ref: "Client",
      required: true,
    },
    shipmentId: {
      type: Number,
      ref: "Shipment",
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank transfer", "cash"],
    },
    paymentDate: {
      type: Date,
      required: false,
    },
    GSTIN: {
      type: String,
      required: false,
    },

    specialInstructions: {
      type: String,
      required: false,
    },
    fuelCost: {
      // change this to driver cost

      type: Number,
      required: false,
    },
  },
  { timestamps: true },
);

// Pre-save hook to auto-increment billId
billSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "billId" },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true },
      );
      this.billId = counter.sequence;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;
