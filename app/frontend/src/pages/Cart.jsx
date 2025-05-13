import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartTotal,
    isLoading,
    error,
  } = useCartStore();

  const [updating, setUpdating] = useState(false);
  const [itemsToUpdate, setItemsToUpdate] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, fetchCart, navigate]);

  const handleQuantityChange = (itemId, quantity) => {
    setItemsToUpdate({
      ...itemsToUpdate,
      [itemId]: quantity,
    });
  };

  const handleUpdateCart = async (itemId) => {
    if (!itemsToUpdate[itemId]) return;

    setUpdating(true);
    await updateCartItem(itemId, itemsToUpdate[itemId]);
    setUpdating(false);

    // Clear the updated item from the tracking object
    const newItemsToUpdate = { ...itemsToUpdate };
    delete newItemsToUpdate[itemId];
    setItemsToUpdate(newItemsToUpdate);
  };

  const handleRemoveItem = async (itemId) => {
    if (confirm("Are you sure you want to remove this item from your cart?")) {
      await removeCartItem(itemId);
    }
  };

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-gray-500">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Link to="/books" className="mt-6 inline-block btn btn-primary">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">
                    Shopping Cart ({items.length} items)
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item._id} className="p-6">
                    <div className="flex flex-col sm:flex-row">
                      {/* Book Image */}
                      <div className="sm:w-24 sm:h-32 flex-shrink-0 mb-4 sm:mb-0">
                        <Link to={`/books/${item.book._id}`}>
                          <img
                            src={
                              item.book.imageURL ||
                              "/placeholder.svg?height=100&width=70"
                            }
                            alt={item.book.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </Link>
                      </div>

                      {/* Book Details */}
                      <div className="sm:ml-6 flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <Link
                              to={`/books/${item.book._id}`}
                              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                            >
                              {item.book.title}
                            </Link>
                            <p className="mt-1 text-sm text-gray-500">
                              by {item.book.author}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <p className="text-lg font-medium text-indigo-600">
                              ${item.book.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center">
                            <label
                              htmlFor={`quantity-${item._id}`}
                              className="sr-only"
                            >
                              Quantity
                            </label>
                            <select
                              id={`quantity-${item._id}`}
                              value={itemsToUpdate[item._id] || item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item._id,
                                  Number(e.target.value)
                                )
                              }
                              className="form-input py-1 pl-2 pr-8 text-sm"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>

                            {itemsToUpdate[item._id] && (
                              <button
                                onClick={() => handleUpdateCart(item._id)}
                                disabled={updating}
                                className="ml-2 text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                {updating ? "Updating..." : "Update"}
                              </button>
                            )}
                          </div>

                          <div className="mt-4 sm:mt-0 flex items-center">
                            <p className="text-sm text-gray-700 mr-4">
                              Subtotal:{" "}
                              <span className="font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </p>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-medium mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    ${(getCartTotal() * 0.1).toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${(getCartTotal() + getCartTotal() * 0.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full mt-6 btn btn-primary py-3"
              >
                Proceed to Checkout
              </button>

              <div className="mt-6">
                <Link
                  to="/books"
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
