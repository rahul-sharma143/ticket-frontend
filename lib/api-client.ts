"use client";

import axios, { type AxiosInstance } from "axios";

export interface CreateBookingData {
  showId: string;
  userId: string;
  seats: number[];
}

export interface ShowResponse {
  id: string;
  name: string;
  start_time: string;
  total_seats: number;
  booked_seats?: number[];
  price: number;
  type?: "trip" | "show";
}

export interface BookingResponse {
  id: string;
  show_id: string;
  user_id: string;
  seats: number[];
  status: "pending" | "confirmed" | "failed";
  total_amount: number;
  created_at: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getShows(): Promise<ShowResponse[]> {
    try {
      const response = await this.axiosInstance.get("/admin/shows");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch shows:", error);
      return [];
    }
  }

  async createShow(showData: any): Promise<ShowResponse> {
    try {
      const payload = {
        name: showData.name,
        start_time: new Date(showData.start_time).toISOString(),
        total_seats: Number(showData.total_seats),
        price: Number(showData.price),
        type: showData.type || "show", // Include type in payload
      };

      const response = await this.axiosInstance.post<ShowResponse>(
        "/admin/shows",
        payload
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend responded with error:", error.response.data);
      } else {
        console.error("Request failed:", error.message);
      }
      throw error;
    }
  }

  async getBookings(): Promise<BookingResponse[]> {
    try {
      const response = await this.axiosInstance.get("/admin/bookings");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      return [];
    }
  }

  async createBooking(
    bookingData: CreateBookingData
  ): Promise<BookingResponse> {
    try {
      const response = await this.axiosInstance.post<BookingResponse>(
        "/bookings",
        bookingData
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend responded with error:", error.response.data);
      } else {
        console.error("Request failed:", error.message);
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
