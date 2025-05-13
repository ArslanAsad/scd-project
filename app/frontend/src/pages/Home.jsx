import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookStore } from "../store/bookStore";

const Home = () => {
  const { fetchBooks, books, isLoading } = useBookStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Featured books (first 4 books)
  const featuredBooks = Array.isArray(books) ? books.slice(0, 4) : [];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="container py-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Discover Your Next Favorite Book
              </h1>
              <p className="text-lg md:text-xl mb-8 text-indigo-100">
                Explore our vast collection of books across all genres. From
                bestsellers to hidden gems, find your perfect read today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/books"
                  className="btn bg-white text-indigo-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-md"
                >
                  Browse Books
                </Link>
                <Link
                  to="/register"
                  className="btn bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="../../public/collection-books.png"
                alt="Books collection"
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Books</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of must-read books that are
              making waves in the literary world.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredBooks.length > 0 ? (
                featuredBooks.map((book) => (
                  <Link
                    to={`/books/${book._id}`}
                    key={book._id}
                    className="card group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={
                          book.imageURL ||
                          "/placeholder.svg?height=400&width=300"
                        }
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
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
                            {book.ratings.toFixed(1) || 4.5}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">
                    No featured books available at the moment.
                  </p>
                  <Link
                    to="/books"
                    className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Browse all books
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/books"
              className="btn btn-outline hover:text-indigo-700 hover:border-indigo-700"
            >
              View All Books
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find your next read by exploring our carefully curated categories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
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
            ]
              .slice(0, 6)
              .map((category) => (
                <Link
                  to={`/books?category=${category}`}
                  key={category}
                  className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="text-indigo-600 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium">{category}</h3>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what book lovers have to
              say about their experience with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Avid Reader",
                quote:
                  "I've been a customer for over a year now, and I'm consistently impressed by the selection and service. The recommendations are spot on!",
              },
              {
                name: "Michael Chen",
                role: "Book Club Organizer",
                quote:
                  "Our book club relies on BookStore for all our monthly picks. The prices are competitive and delivery is always prompt.",
              },
              {
                name: "Emily Rodriguez",
                role: "Literature Professor",
                quote:
                  "As someone who reads professionally, I appreciate the quality of books and the thoughtful curation. My go-to bookstore online!",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
            <p className="mb-8">
              Subscribe to get updates on new releases, exclusive offers, and
              reading recommendations.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              />
              <button
                type="submit"
                className="btn bg-white text-indigo-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-md"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-sm text-indigo-200">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
