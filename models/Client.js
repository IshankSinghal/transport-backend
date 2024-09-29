const mongoose = require("mongoose");
const Counter = require("./Counter"); // Adjust the path as needed

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

clientSchema.pre("save", async function (next) {
  console.log("insideeee");
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "clientId" },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true },
      );

      this.clientId = counter.sequence;
      next();
    } catch (error) {
      console.error("Error incrementing clientId:", error);
      return next(error);
    }
  } else {
    next();
  }
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
