import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useBookStore } from "../store/bookStore";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const BookDetails = () => {
  const { id } = useParams();
  const { fetchBookById, book, isLoading, addReview } = useBookStore();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [reviewError, setReviewError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchBookById(id);
    // Reset state when book changes
    setQuantity(1);
    setActiveTab("description");
    setAddedToCart(false);
  }, [id, fetchBookById]);

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setAddingToCart(true);
    const success = await addToCart(id, quantity);
    setAddingToCart(false);

    if (success) {
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: name === "rating" ? Number.parseInt(value) : value,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.comment.trim()) {
      setReviewError("Please enter a review comment");
      return;
    }

    setReviewError("");
    const success = await addReview(id, reviewForm);

    if (success) {
      setReviewForm({
        rating: 5,
        comment: "",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Book not found</h2>
          <p className="mt-2 text-gray-600">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/books"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
          >
            Browse all books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex text-sm text-gray-600">
          <li className="flex items-center">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>
            <svg
              className="h-4 w-4 mx-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li className="flex items-center">
            <Link to="/books" className="hover:text-indigo-600">
              Books
            </Link>
            <svg
              className="h-4 w-4 mx-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li className="text-gray-900 font-medium truncate">{book.title}</li>
        </ol>
      </nav>

      {/* Book Details */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
          {/* Book Image */}
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] overflow-hidden rounded-lg border border-gray-200">
              <img
                src={book.imageURL || "/placeholder.svg?height=600&width=400"}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    className={`w-5 h-5 ${
                      index < (book.ratings.toFixed(1) || 4)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {book.ratings.toFixed(1) || 4} ({book.reviews?.length || 0}{" "}
                reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center">
                <span className="text-3xl font-bold text-indigo-600">
                  ${book.price?.toFixed(2)}
                </span>
                {book.originalPrice && (
                  <span className="ml-3 text-lg text-gray-500 line-through">
                    ${book.originalPrice?.toFixed(2)}
                  </span>
                )}
                {book.discount > 0 && (
                  <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                    {book.discount}% OFF
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {book.stock > 0 ? "In Stock" : "Out of Stock"}
              </p>
            </div>

            {/* Book Details */}
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">
                  Publisher:{" "}
                  <span className="text-gray-900">
                    {book.publisher || "Unknown"}
                  </span>
                </p>
                <p className="text-gray-600">
                  Publication Date:{" "}
                  <span className="text-gray-900">
                    {book.publicationDate || "Unknown"}
                  </span>
                </p>
                <p className="text-gray-600">
                  Language:{" "}
                  <span className="text-gray-900">
                    {book.language || "English"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  Pages:{" "}
                  <span className="text-gray-900">
                    {book.pages || "Unknown"}
                  </span>
                </p>
                <p className="text-gray-600">
                  ISBN:{" "}
                  <span className="text-gray-900">
                    {book.isbn || "Unknown"}
                  </span>
                </p>
                <p className="text-gray-600">
                  Category:{" "}
                  <span className="text-gray-900">
                    {book.category || "Fiction"}
                  </span>
                </p>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={decrementQuantity}
                  className="px-3 py-2 border-r border-gray-300 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-12 text-center border-none focus:ring-0"
                />
                <button
                  onClick={incrementQuantity}
                  className="px-3 py-2 border-l border-gray-300 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || book.stock <= 0}
                className={`flex-grow flex items-center justify-center gap-2 py-2 px-6 rounded-md font-medium ${
                  book.stock > 0
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-300 cursor-not-allowed text-gray-500"
                }`}
              >
                {addingToCart ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </>
                ) : addedToCart ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Wishlist and Share */}
            <div className="flex mt-4 gap-4">
              <button className="flex items-center text-gray-600 hover:text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Add to Wishlist
              </button>
              <button className="flex items-center text-gray-600 hover:text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "description"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "details"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "reviews"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Reviews ({book.reviews?.length || 0})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p>
                  {book.description ||
                    "No description available for this book."}
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Book Details</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Title</td>
                        <td className="py-3 text-gray-900">{book.title}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Author</td>
                        <td className="py-3 text-gray-900">{book.author}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Publisher</td>
                        <td className="py-3 text-gray-900">
                          {book.publisher || "Unknown"}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Publication Date</td>
                        <td className="py-3 text-gray-900">
                          {book.publicationDate || "Unknown"}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Language</td>
                        <td className="py-3 text-gray-900">
                          {book.language || "English"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Additional Information
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Pages</td>
                        <td className="py-3 text-gray-900">
                          {book.pages || "Unknown"}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">ISBN</td>
                        <td className="py-3 text-gray-900">
                          {book.isbn || "Unknown"}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Category</td>
                        <td className="py-3 text-gray-900">
                          {book.category || "Fiction"}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Format</td>
                        <td className="py-3 text-gray-900">
                          {book.format || "Paperback"}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 text-gray-600">Dimensions</td>
                        <td className="py-3 text-gray-900">
                          {book.dimensions || "Unknown"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {/* Review Form */}
                {isAuthenticated ? (
                  <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewForm({ ...reviewForm, rating: star })
                              }
                              className="p-1"
                            >
                              <svg
                                className={`w-6 h-6 ${
                                  star <= reviewForm.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="comment"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Your Review
                        </label>
                        <textarea
                          id="comment"
                          name="comment"
                          rows={4}
                          className={`form-input ${
                            reviewError ? "border-red-500" : ""
                          }`}
                          placeholder="Share your thoughts about this book..."
                          value={reviewForm.comment}
                          onChange={handleReviewChange}
                        ></textarea>
                        {reviewError && (
                          <p className="mt-1 text-sm text-red-600">
                            {reviewError}
                          </p>
                        )}
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Submit Review
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="mb-8 bg-gray-50 p-6 rounded-lg text-center">
                    <p className="mb-4">Please sign in to leave a review.</p>
                    <Link to="/login" className="btn btn-primary">
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>

                {book.reviews && book.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {book.reviews.map((review, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-200 pb-6 last:border-b-0"
                      >
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="font-medium">
                            {review.user?.name || "Anonymous"}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No reviews yet. Be the first to review this book!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
