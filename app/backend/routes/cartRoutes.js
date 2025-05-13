const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

// Get user cart
router.get("/", protect, cartController.getCart);

// Add item to cart
router.post(
  "/add",
  [
    protect,
    check("bookId", "Book ID is required").not().isEmpty(),
    check("quantity", "Quantity must be at least 1").isInt({ min: 1 }),
  ],
  cartController.addToCart
);

// Update cart item quantity
router.put(
  "/update",
  [
    protect,
    check("itemId", "Item ID is required").not().isEmpty(),
    check("quantity", "Quantity must be at least 1").isInt({ min: 1 }),
  ],
  cartController.updateCartItem
);

// Remove item from cart
router.delete("/item/:itemId", protect, cartController.removeCartItem);

// Clear cart
router.delete("/clear", protect, cartController.clearCart);

module.exports = router;
