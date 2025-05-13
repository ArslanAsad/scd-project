const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const bookController = require("../controllers/bookController");
const { protect, admin } = require("../middleware/auth");

// Get all books with pagination and filters
router.get("/", bookController.getBooks);

// Get single book by ID
router.get("/:id", bookController.getBookById);

// Create new book (admin only)
router.post(
  "/",
  [
    protect,
    admin,
    check("title", "Title is required").not().isEmpty(),
    check("author", "Author is required").not().isEmpty(),
    check("price", "Price is required and must be a number").isNumeric(),
    check("category", "Category is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("stock", "Stock is required and must be a number").isNumeric(),
    check("imageURL", "Image URL is required").not().isEmpty(),
  ],
  bookController.createBook
);

// Update book (admin only)
router.put(
  "/:id",
  [
    protect,
    admin,
    check("title", "Title is required").optional().not().isEmpty(),
    check("author", "Author is required").optional().not().isEmpty(),
    check("price", "Price must be a number").optional().isNumeric(),
    check("category", "Category is required").optional().not().isEmpty(),
    check("stock", "Stock must be a number").optional().isNumeric(),
    check("imageURL", "Image URL is required").optional().not().isEmpty(),
  ],
  bookController.updateBook
);

// Delete book (admin only)
router.delete("/:id", protect, admin, bookController.deleteBook);

// Create book review
router.post(
  "/:id/reviews",
  [
    protect,
    check("rating", "Rating is required and must be between 1 and 5").isInt({
      min: 1,
      max: 5,
    }),
  ],
  bookController.createBookReview
);

module.exports = router;
