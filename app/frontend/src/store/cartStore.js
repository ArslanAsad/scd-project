import { create } from "zustand";
import axios from "axios";

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cart`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ items: response.data.items || [], isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch cart",
        isLoading: false,
      });
    }
  },

  addToCart: async (bookId, quantity = 1) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    set({ isLoading: true });
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cart/add`,
        { bookId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await get().fetchCart();
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add item to cart",
        isLoading: false,
      });
      return false;
    }
  },

  updateCartItem: async (itemId, quantity) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    set({ isLoading: true });
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/cart/update`,
        { itemId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await get().fetchCart();
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update cart item",
        isLoading: false,
      });
      return false;
    }
  },

  removeCartItem: async (itemId) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    set({ isLoading: true });
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/cart/item/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await get().fetchCart();
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to remove cart item",
        isLoading: false,
      });
      return false;
    }
  },

  clearCart: async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    set({ isLoading: true });
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ items: [], isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to clear cart",
        isLoading: false,
      });
      return false;
    }
  },

  getCartTotal: () => {
    return get().items.reduce((total, item) => {
      return total + item.book.price * item.quantity;
    }, 0);
  },

  getCartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
