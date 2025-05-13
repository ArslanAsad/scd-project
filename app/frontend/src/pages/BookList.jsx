import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useBookStore } from "../store/bookStore";

const BookList = () => {
  const { books, fetchBooks, isLoading, filters, setFilters, clearFilters } =
    useBookStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const [showFilters, setShowFilters] = useState(false);

  // Categories for filter
  const categories = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Science Fiction",
    "Romance",
    "Biography",
    "History",
    "Self-Help",
    "Business",
    "Children",
    "Young Adult",
    "Poetry",
  ];

  useEffect(() => {
    // Get filters from URL if any
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const rating = searchParams.get("rating");
    const page = searchParams.get("page");

    // Update filters from URL params
    const newFilters = { ...filters };
    if (category) newFilters.category = category;
    if (searchQuery) newFilters.searchQuery = searchQuery;
    if (minPrice) newFilters.minPrice = Number(minPrice);
    if (maxPrice) newFilters.maxPrice = Number(maxPrice);
    if (rating) newFilters.rating = Number(rating);
    if (page) newFilters.page = Number(page);

    setFilters(newFilters);
    setPriceRange([newFilters.minPrice, newFilters.maxPrice]);

    fetchBooks();
  }, [searchParams, fetchBooks]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.searchQuery) params.set("search", filters.searchQuery);
    if (filters.minPrice > 0)
      params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice < 1000)
      params.set("maxPrice", filters.maxPrice.toString());
    if (filters.rating > 0) params.set("rating", filters.rating.toString());
    if (filters.page > 1) params.set("page", filters.page.toString());

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleCategoryChange = (category) => {
    setFilters({
      ...filters,
      category: category === filters.category ? "" : category,
    });
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const index = Number(e.target.dataset.index);
    const newPriceRange = [...priceRange];
    newPriceRange[index] = Number(value);
    setPriceRange(newPriceRange);
  };

  const applyPriceFilter = () => {
    setFilters({
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const handleRatingChange = (rating) => {
    setFilters({ ...filters, rating: rating === filters.rating ? 0 : rating });
  };

  const handleClearFilters = () => {
    clearFilters();
    setPriceRange([0, 1000]);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - Mobile Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={toggleFilters}
            className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
          >
            <span className="font-medium">Filters</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Filters Sidebar */}
        <div
          className={`md:w-1/4 ${showFilters ? "block" : "hidden"} md:block`}
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={handleClearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={filters.category === category}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ${priceRange[0]}
                  </span>
                  <span className="text-sm text-gray-600">
                    ${priceRange[1]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min-price" className="sr-only">
                      Minimum Price
                    </label>
                    <input
                      type="number"
                      id="min-price"
                      data-index="0"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={handlePriceChange}
                      className="form-input text-sm"
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="sr-only">
                      Maximum Price
                    </label>
                    <input
                      type="number"
                      id="max-price"
                      data-index="1"
                      min={priceRange[0]}
                      max="1000"
                      value={priceRange[1]}
                      onChange={handlePriceChange}
                      className="form-input text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <button
                  onClick={applyPriceFilter}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-medium mb-3">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onChange={() => handleRatingChange(rating)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="ml-2 flex items-center"
                    >
                      {Array.from({ length: 5 }).map((_, index) => (
                        <svg
                          key={index}
                          className={`w-4 h-4 ${
                            index < rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm text-gray-600">& Up</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Book Grid */}
        <div className="md:w-3/4">
          {/* Active Filters */}
          {(filters.category ||
            filters.minPrice > 0 ||
            filters.maxPrice < 1000 ||
            filters.rating > 0 ||
            filters.searchQuery) && (
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">
                Active Filters:
              </span>

              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Category: {filters.category}
                  <button
                    onClick={() => setFilters({ ...filters, category: "" })}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}

              {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Price: ${filters.minPrice} - ${filters.maxPrice}
                  <button
                    onClick={() => {
                      setFilters({ ...filters, minPrice: 0, maxPrice: 1000 });
                      setPriceRange([0, 1000]);
                    }}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}

              {filters.rating > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Rating: {filters.rating}+ Stars
                  <button
                    onClick={() => setFilters({ ...filters, rating: 0 })}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}

              {filters.searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Search: {filters.searchQuery}
                  <button
                    onClick={() => setFilters({ ...filters, searchQuery: "" })}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Books Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Link
                  to={`/books/${book._id}`}
                  key={book._id}
                  className="card group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={
                        book.imageURL || "/placeholder.svg?height=400&width=300"
                      }
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {book.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {book.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{book.author}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-indigo-600">
                          ${book.price.toFixed(2)}
                        </span>
                        {book.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${book.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">
                          {book.ratings.toFixed(1) || 4}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No books found
              </h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your filters or search criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setFilters({ page: filters.page - 1 })}
          disabled={filters.page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
        >
          Prev
        </button>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setFilters({ page: page })}
            className={`px-3 py-1 border rounded cursor-pointer ${
              page === filters.page
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setFilters({ page: filters.page + 1 })}
          disabled={filters.page === 10}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookList;
