const jwt = require("jsonwebtoken");
require("dotenv").config();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.googleCallback = (req, res) => {
  // Generate JWT token
  const token = generateToken(req.user._id);

  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
};
