const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

// Create order from cart
router.post(
  "/",
  [
    protect,
    check("shippingAddress.street", "Street address is required")
      .not()
      .isEmpty(),
    check("shippingAddress.city", "City is required").not().isEmpty(),
    check("shippingAddress.state", "State is required").not().isEmpty(),
    check("shippingAddress.zipCode", "Zip code is required").not().isEmpty(),
    check("shippingAddress.country", "Country is required").not().isEmpty(),
  ],
  orderController.createOrder
);

// Get user's orders
router.get("/", protect, orderController.getUserOrders);

// Get order by ID
router.get("/:id", protect, orderController.getOrderById);

// Update order status (admin only)
router.put(
  "/:id/status",
  [
    protect,
    admin,
    check("orderStatus", "Order status is required").isIn([
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  ],
  orderController.updateOrderStatus
);

module.exports = router;
