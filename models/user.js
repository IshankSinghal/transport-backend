const bcrypt = require("bcryptjs");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const SALT_ROUNDS = 10;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true },
);

const User = model("user", userSchema);

module.exports = User;
