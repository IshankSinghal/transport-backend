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

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  try {
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    user.password = hashedPassword; // Store the hashed password
    next();
  } catch (err) {
    return next(err); // Pass any error to the next middleware
  }
});

// Static method to compare password and generate token
userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found!");

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Incorrect Password");

    // Generate token upon successful password match
    const token = createTokenForUser(user);
    return token;
  },
);

const User = model("user", userSchema);

module.exports = User;
