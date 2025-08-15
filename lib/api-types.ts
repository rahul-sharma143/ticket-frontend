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
