const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Create checkout session
router.post(
  "/create-checkout-session",
  [protect, check("orderId", "Order ID is required").not().isEmpty()],
  paymentController.createCheckoutSession
);

// Stripe webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

module.exports = router;
