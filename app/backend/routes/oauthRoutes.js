const express = require("express");
const passport = require("passport");
const router = express.Router();
const oauthController = require("../controllers/oauthController");

// Initialize passport
require("../config/passport");

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/oauth/login" }),
  oauthController.googleCallback
);

module.exports = router;
