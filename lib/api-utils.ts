"use client";

import type { Show, Booking } from "@/contexts/booking-context";
import type { ShowResponse, BookingResponse } from "./api-client";
import type { CreateBookingData } from "./api-client";

// Transform API responses to internal types
export function transformShowResponse(apiShow: ShowResponse): Show {
  return {
    id: apiShow.id,
    name: apiShow.name,
    startTime: apiShow.start_time,
    totalSeats: apiShow.total_seats,
    bookedSeats: apiShow.booked_seats || [],
    price: apiShow.price,
    type: apiShow.type ?? "show",
  };
}

export function transformBookingResponse(apiBooking: BookingResponse): Booking {
  return {
    id: apiBooking.id,
    showId: apiBooking.show_id,
    userId: apiBooking.user_id,
    seats: apiBooking.seats,
    status: apiBooking.status,
    totalAmount: apiBooking.total_amount,
    createdAt: apiBooking.created_at,
  };
}

// Transform internal types to API requests
export function transformShowToRequest(show: Omit<Show, "id" | "bookedSeats">) {
  return {
    name: show.name,
    start_time: show.startTime,
    total_seats: show.totalSeats,
    price: show.price,
    type: show.type,
  };
}

export function transformBookingToRequest(
  showId: string,
  seats: number[],
  userId: string
): CreateBookingData {
  return {
    showId,
    userId,
    seats,
  };
}

// API Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Network error") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    );
  }
  return false;
}

// Retry utility for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError!;
}

// Local storage utilities for offline persistence
const STORAGE_KEYS = {
  SHOWS: "ticketbook_shows",
  BOOKINGS: "ticketbook_bookings",
} as const;

export function saveShowsToStorage(shows: Show[]): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SHOWS, JSON.stringify(shows));
    }
  } catch (error) {
    console.warn("Failed to save shows to localStorage:", error);
  }
}

export function loadShowsFromStorage(): Show[] {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOWS);
      return stored ? JSON.parse(stored) : [];
    }
  } catch (error) {
    console.warn("Failed to load shows from localStorage:", error);
  }
  return [];
}

export function saveBookingsToStorage(bookings: Booking[]): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }
  } catch (error) {
    console.warn("Failed to save bookings to localStorage:", error);
  }
}

export function loadBookingsFromStorage(): Booking[] {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return stored ? JSON.parse(stored) : [];
    }
  } catch (error) {
    console.warn("Failed to load bookings from localStorage:", error);
  }
  return [];
}

export function clearStorageData(): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.SHOWS);
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    }
  } catch (error) {
    console.warn("Failed to clear storage data:", error);
  }
}
