const Cart = require("../models/Cart");
const Book = require("../models/Book");
const { validationResult } = require("express-validator");

// Get user cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.book",
      "title author imageURL price"
    );

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId, quantity } = req.body;

    // Check if book exists and has enough stock
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      // Add new item to cart
      cart.items.push({
        book: bookId,
        quantity: Number(quantity),
        price: book.price,
      });
    }

    // Save updated cart
    await cart.save();

    // Populate book details for response
    cart = await Cart.findById(cart._id).populate(
      "items.book",
      "title author imageURL price"
    );

    res.status(201).json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, quantity } = req.body;

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Get the book to check stock
    const book = await Book.findById(cart.items[itemIndex].book);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Update quantity
    cart.items[itemIndex].quantity = Number(quantity);

    // Save updated cart
    await cart.save();

    // Populate book details for response
    cart = await Cart.findById(cart._id).populate(
      "items.book",
      "title author imageURL price"
    );

    res.json(cart);
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove item from cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item at the found index
    cart.items.splice(itemIndex, 1);

    // Save updated cart
    await cart.save();

    // Populate book details for response
    cart = await Cart.findById(cart._id).populate(
      "items.book",
      "title author imageURL price"
    );

    res.json(cart);
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear cart items
    cart.items = [];

    // Save updated cart
    await cart.save();

    res.json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get cart total
exports.getCartTotal = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ itemCount: 0, totalAmount: 0 });
    }

    const itemCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    res.json({
      itemCount,
      totalAmount: cart.totalAmount,
    });
  } catch (error) {
    console.error("Get cart total error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
