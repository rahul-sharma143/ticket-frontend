"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { apiClient } from "../lib/api-client";
import {
  transformShowResponse,
  transformBookingResponse,
  transformShowToRequest,
  transformBookingToRequest,
} from "../lib/api-utils";

export interface Show {
  id: string;
  name: string;
  startTime: string;
  totalSeats: number;
  bookedSeats: number[];
  price: number;
  type: "trip" | "show";
}

export interface Booking {
  id: string;
  showId: string;
  userId: string;
  seats: number[];
  status: "pending" | "confirmed" | "failed";
  totalAmount: number;
  createdAt: string;
}

interface BookingContextType {
  shows: Show[];
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  addShow: (
    show: Omit<Show, "id" | "bookedSeats"> & { type?: "show" | "trip" }
  ) => Promise<boolean>;
  getShow: (id: string) => Show | undefined;
  createBooking: (
    showId: string,
    seats: number[],
    userId: string
  ) => Promise<boolean>;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByShow: (showId: string) => Booking[];
  refreshShows: () => Promise<void>;
  clearError: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SHOWS: "booking_shows_data",
  BOOKINGS: "booking_bookings_data",
} as const;

// ✅ Save data to localStorage
const saveToStorage = (key: string, data: Show[] | Booking[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ✅ Load data from localStorage
const loadFromStorage = (key: string): Show[] | Booking[] => {
  const item = localStorage.getItem(key);
  if (!item) return [];
  return JSON.parse(item);
};

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load shows & bookings on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (isInitialized) return;

      setLoading(true);
      try {
        const savedShows = loadFromStorage(STORAGE_KEYS.SHOWS) as Show[];
        const savedBookings = loadFromStorage(
          STORAGE_KEYS.BOOKINGS
        ) as Booking[];

        if (savedShows.length > 0) setShows(savedShows);
        if (savedBookings.length > 0) setBookings(savedBookings);

        // Try fetching from API if available
        try {
          const showsFromApi = await apiClient.getShows();
          if (Array.isArray(showsFromApi) && showsFromApi.length > 0) {
            const transformedShows = showsFromApi.map(transformShowResponse);
            setShows(transformedShows);
            saveToStorage(STORAGE_KEYS.SHOWS, transformedShows);
          }

          const bookingsFromApi = await apiClient.getBookings();
          if (Array.isArray(bookingsFromApi) && bookingsFromApi.length > 0) {
            const transformedBookings = bookingsFromApi.map(
              transformBookingResponse
            );
            setBookings(transformedBookings);
            saveToStorage(STORAGE_KEYS.BOOKINGS, transformedBookings);
          }
        } catch (apiError) {
          console.log("API not available, using local data:", apiError);
          if (savedShows.length === 0 && savedBookings.length === 0) {
            setError("API not available. Data will be stored locally.");
          }
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load data. Using local storage.");
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadInitialData();
  }, [isInitialized]);

  // Add new show
  const addShow = useCallback(
    async (
      showData: Omit<Show, "id" | "bookedSeats"> & { type?: "show" | "trip" }
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const newShow: Show = {
          id: `show_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 11)}`,
          name: showData.name,
          startTime: showData.startTime,
          totalSeats: showData.totalSeats,
          bookedSeats: [],
          price: showData.price,
          type: showData.type || "show",
        };

        // Try API first
        try {
          const payload = transformShowToRequest(showData);
          const response = await apiClient.createShow(payload);

          if (response && typeof response === "object") {
            const apiShow = transformShowResponse(response);
            setShows((prev) => {
              const updated = [...prev, apiShow];
              saveToStorage(STORAGE_KEYS.SHOWS, updated);
              return updated;
            });
            return true;
          }
        } catch (apiError) {
          console.log("API call failed, using local storage:", apiError);
        }

        // Fallback to local storage
        setShows((prev) => {
          const updated = [...prev, newShow];
          saveToStorage(STORAGE_KEYS.SHOWS, updated);
          return updated;
        });

        return true;
      } catch (err) {
        console.error("Failed to add show:", err);
        setError("Failed to add show. Please try again.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get show by ID
  const getShow = useCallback(
    (id: string): Show | undefined => shows.find((show) => show.id === id),
    [shows]
  );

  // Create booking
  const createBooking = useCallback(
    async (
      showId: string,
      seats: number[],
      userId: string
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const show = shows.find((s) => s.id === showId);
        if (!show) {
          setError("Show not found");
          setLoading(false);
          return false;
        }

        const unavailableSeats = seats.filter((seat) =>
          show.bookedSeats.includes(seat)
        );
        if (unavailableSeats.length > 0) {
          setError(`Seats ${unavailableSeats.join(", ")} are already booked`);
          setLoading(false);
          return false;
        }

        const newBooking: Booking = {
          id: `booking_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 11)}`,
          showId,
          userId,
          seats,
          status: "confirmed",
          totalAmount: seats.length * show.price,
          createdAt: new Date().toISOString(),
        };

        // Try API
        try {
          const payload = transformBookingToRequest(showId, seats, userId);
          const response = await apiClient.createBooking(payload);

          if (response && typeof response === "object") {
            const apiBooking = transformBookingResponse(response);
            setBookings((prev) => {
              const updated = [...prev, apiBooking];
              saveToStorage(STORAGE_KEYS.BOOKINGS, updated);
              return updated;
            });

            setShows((prev) => {
              const updated = prev.map((show) =>
                show.id === showId
                  ? { ...show, bookedSeats: [...show.bookedSeats, ...seats] }
                  : show
              );
              saveToStorage(STORAGE_KEYS.SHOWS, updated);
              return updated;
            });

            return true;
          }
        } catch (apiError) {
          console.log("Booking API failed, using local storage:", apiError);
        }

        // Fallback to local
        setBookings((prev) => {
          const updated = [...prev, newBooking];
          saveToStorage(STORAGE_KEYS.BOOKINGS, updated);
          return updated;
        });

        setShows((prev) => {
          const updated = prev.map((show) =>
            show.id === showId
              ? { ...show, bookedSeats: [...show.bookedSeats, ...seats] }
              : show
          );
          saveToStorage(STORAGE_KEYS.SHOWS, updated);
          return updated;
        });

        return true;
      } catch (err) {
        console.error("Booking failed:", err);
        setError("Booking failed. Please try again.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [shows]
  );

  const getBookingsByUser = useCallback(
    (userId: string): Booking[] => bookings.filter((b) => b.userId === userId),
    [bookings]
  );

  const getBookingsByShow = useCallback(
    (showId: string): Booking[] => bookings.filter((b) => b.showId === showId),
    [bookings]
  );

  // Refresh data from API
  const refreshShows = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const showsFromApi = await apiClient.getShows();
      if (Array.isArray(showsFromApi)) {
        const transformedShows = showsFromApi.map(transformShowResponse);
        setShows(transformedShows);
        saveToStorage(STORAGE_KEYS.SHOWS, transformedShows);
      }

      const bookingsFromApi = await apiClient.getBookings();
      if (Array.isArray(bookingsFromApi)) {
        const transformedBookings = bookingsFromApi.map(
          transformBookingResponse
        );
        setBookings(transformedBookings);
        saveToStorage(STORAGE_KEYS.BOOKINGS, transformedBookings);
      }
    } catch (err) {
      console.log("Refresh failed, keeping local data:", err);
      if (shows.length === 0) setError("Failed to refresh data from server");
    } finally {
      setLoading(false);
    }
  }, [shows.length]);

  const clearError = useCallback(() => setError(null), []);

  const value: BookingContextType = {
    shows,
    bookings,
    loading,
    error,
    addShow,
    getShow,
    createBooking,
    getBookingsByUser,
    getBookingsByShow,
    refreshShows,
    clearError,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
