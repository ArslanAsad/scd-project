import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useOrderStore } from "../store/orderStore";
import { useAuthStore } from "../store/authStore";

const OrderConfirmation = () => {
  const { id } = useParams();
  const { fetchOrderById, currentOrder, isLoading } = useOrderStore();
  const { isAuthenticated } = useAuthStore();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrderById(id);
    }

    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, id, fetchOrderById]);

  if (isLoading) {
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Animation */}
          <div className="mb-6 flex justify-center">
            <div
              className={`relative rounded-full h-24 w-24 bg-green-100 flex items-center justify-center transition-all duration-1000 ${
                animationComplete ? "scale-100" : "scale-0"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-12 w-12 text-green-600 transition-all duration-1000 ${
                  animationComplete ? "opacity-100" : "opacity-0"
                }`}
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
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your order has been received and is
            being processed.
          </p>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg inline-block">
            <p className="text-gray-700">
              Order ID: <span className="font-medium">{id || "N/A"}</span>
            </p>
          </div>

          {currentOrder ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-left">
                Order Details
              </h2>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {currentOrder.items?.map((item, index) => (
                    <div key={index} className="p-4 flex items-center">
                      <div className="w-16 h-24 flex-shrink-0">
                        <img
                          src={
                            item.book?.imageURL ||
                            "/placeholder.svg?height=100&width=70"
                          }
                          alt={item.book?.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium">{item.book?.title}</h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ${currentOrder.subtotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">
                      ${currentOrder.tax?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      ${currentOrder.shipping?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-indigo-600">
                      ${currentOrder.totalAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-left">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <address className="not-italic text-gray-600">
                  {currentOrder.shippingAddress?.street}
                  <br />
                  {currentOrder.shippingAddress?.city},{" "}
                  {currentOrder.shippingAddress?.state}{" "}
                  {currentOrder.shippingAddress?.zipCode}
                  <br />
                  {currentOrder.shippingAddress?.country}
                </address>
              </div>
            </div>
          ) : (
            <div className="mb-8 text-gray-600">
              <p>Your order details will be available soon.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn btn-outline">
              Return to Home
            </Link>
            <Link to="/books" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
