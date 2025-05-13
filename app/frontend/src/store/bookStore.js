import { create } from "zustand";
import axios from "axios";

export const useBookStore = create((set, get) => ({
  books: [],
  book: null,
  isLoading: false,
  error: null,
  filters: {
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    rating: 0,
    searchQuery: "",
    page: 1,
  },

  fetchBooks: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/books`,
        {
          params: filters,
        }
      );
      set({ books: response.data.books, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch books",
        isLoading: false,
      });
    }
  },

  fetchBookById: async (id) => {
    set({ isLoading: true, book: null });
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/books/${id}`
      );
      set({ book: response.data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch book details",
        isLoading: false,
      });
    }
  },

  addReview: async (bookId, reviewData) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/books/${bookId}/reviews`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh book details after adding review
      await get().fetchBookById(bookId);
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add review",
      });
      return false;
    }
  },

  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters },
    });
  },

  clearFilters: () => {
    set({
      filters: {
        category: "",
        minPrice: 0,
        maxPrice: 1000,
        rating: 0,
        searchQuery: "",
      },
    });
  },
}));
