const Book = require("../models/Book");
const { validationResult } = require("express-validator");

// Get all books with pagination and filters
exports.getBooks = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const currentPage = Number(req.query.page) || 1;

    // Build filter object
    const filter = {};

    // Handle generic search query
    if (req.query.searchQuery) {
      const regex = new RegExp(req.query.searchQuery, "i"); // case-insensitive
      filter.$or = [
        { title: regex },
        { author: regex }, // Add other fields you want to search
        { description: regex },
      ];
    }

    // Search by title
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Filter by rating
    if (req.query.minRating) {
      filter.averageRating = { $gte: Number(req.query.minRating) };
    }

    // Count total books that match the filter
    const count = await Book.countDocuments(filter);

    // Get paginated books
    const books = await Book.find(filter)
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
      .sort({ createdAt: -1 });

    res.json({
      books,
      page: currentPage,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("Get book by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new book (admin only)
exports.createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, price, category, description, stock, imageURL } =
      req.body;

    const book = await Book.create({
      title,
      author,
      price,
      category,
      description,
      stock,
      imageURL,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update book (admin only)
exports.updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, price, category, description, stock, imageURL } =
      req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Update book fields
    book.title = title || book.title;
    book.author = author || book.author;
    book.price = price || book.price;
    book.category = category || book.category;
    book.description = description || book.description;
    book.stock = stock !== undefined ? stock : book.stock;
    book.imageURL = imageURL || book.imageURL;

    const updatedBook = await book.save();

    res.json(updatedBook);
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete book (admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await book.remove();

    res.json({ message: "Book removed" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create book review
exports.createBookReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user already reviewed this book
    const alreadyReviewed = book.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this book" });
    }

    // Create new review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
    };

    // Add review to book
    book.reviews.push(review);

    // Save book with updated reviews
    await book.save();

    res.status(201).json({ message: "Review added" });
  } catch (error) {
    console.error("Create book review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
