import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useOrderStore } from "../store/orderStore";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { isAuthenticated, user } = useAuthStore();
  const { items, getCartTotal } = useCartStore();
  const { createCheckoutSession } = useOrderStore();

  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleBillingDetailsChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setBillingDetails({
        ...billingDetails,
        [parent]: {
          ...billingDetails[parent],
          [child]: value,
        },
      });
    } else {
      setBillingDetails({
        ...billingDetails,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create a checkout session on the server with shipping address
      const session = await createCheckoutSession(billingDetails.address);

      if (session && session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        setError("Failed to create checkout session");
        setProcessing(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred during checkout");
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={billingDetails.name}
              onChange={handleBillingDetailsChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={billingDetails.email}
              onChange={handleBillingDetailsChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address.street" className="form-label">
              Street Address
            </label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              className="form-input"
              value={billingDetails.address.street}
              onChange={handleBillingDetailsChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address.city" className="form-label">
              City
            </label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              className="form-input"
              value={billingDetails.address.city}
              onChange={handleBillingDetailsChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address.state" className="form-label">
              State
            </label>
            <input
              type="text"
              id="address.state"
              name="address.state"
              className="form-input"
              value={billingDetails.address.state}
              onChange={handleBillingDetailsChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address.zipCode" className="form-label">
              ZIP / Postal Code
            </label>
            <input
              type="text"
              id="address.zipCode"
              name="address.zipCode"
              className="form-input"
              value={billingDetails.address.zipCode}
              onChange={handleBillingDetailsChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address.country" className="form-label">
              Country
            </label>
            <input
              type="text"
              id="address.country"
              name="address.country"
              className="form-input"
              value={billingDetails.address.country}
              onChange={handleBillingDetailsChange}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Payment Information</h3>
        <div className="border border-gray-300 rounded-md p-4">
          <CardElement options={cardElementOptions} onChange={handleChange} />
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      <button
        type="submit"
        disabled={processing || disabled || succeeded}
        className={`w-full btn btn-primary py-3 ${
          processing || disabled || succeeded
            ? "opacity-70 cursor-not-allowed"
            : ""
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            Processing...
          </div>
        ) : (
          `Pay $${(getCartTotal() + getCartTotal() * 0.1).toFixed(2)}`
        )}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { items, getCartTotal } = useCartStore();

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-medium mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item._id} className="flex">
                  <div className="w-16 h-24 flex-shrink-0">
                    <img
                      src={
                        item.book.imageURL ||
                        "/placeholder.svg?height=100&width=70"
                      }
                      alt={item.book.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{item.book.title}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
