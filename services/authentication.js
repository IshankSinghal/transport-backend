const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign(
    { user: { id: userId, role: role } },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
};

module.exports = generateToken;
