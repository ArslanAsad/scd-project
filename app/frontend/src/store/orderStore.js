import { create } from "zustand";
import axios from "axios";
import { useCartStore } from "./cartStore";

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  createOrder: async (shippingAddress) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    set({ isLoading: true });
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        { shippingAddress },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ currentOrder: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create order",
        isLoading: false,
      });
      return null;
    }
  },

  createCheckoutSession: async (shippingAddress) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      // First create the order with shipping address
      const order = await get().createOrder(shippingAddress);
      if (!order) {
        throw new Error("Failed to create order");
      }

      // Then create the checkout session
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/create-checkout-session`,
        { orderId: order._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Create checkout session error:", error);
      throw error;
    }
  },

  fetchOrders: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ orders: response.data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch orders",
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true, currentOrder: null });
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ currentOrder: response.data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch order details",
        isLoading: false,
      });
    }
  },
}));
