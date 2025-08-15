"use client";

import { useState } from "react";
import { useBooking } from "@/contexts/booking-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Search,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export function ShowList() {
  const { shows, loading, error, createBooking } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "show" | "trip">("all");
  const [selectedSeats, setSelectedSeats] = useState<{
    [showId: string]: number[];
  }>({});
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  // Filter shows based on search and type
  const filteredShows = shows.filter((show) => {
    const matchesSearch = show.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const showType = show.type || "show"; // Default to "show" if type is undefined
    const matchesType = filterType === "all" || showType === filterType;
    return matchesSearch && matchesType;
  });

  const handleSeatSelection = (showId: string, seatNumber: number) => {
    setSelectedSeats((prev) => {
      const currentSeats = prev[showId] || [];
      const isSelected = currentSeats.includes(seatNumber);

      if (isSelected) {
        return {
          ...prev,
          [showId]: currentSeats.filter((seat) => seat !== seatNumber),
        };
      } else {
        return {
          ...prev,
          [showId]: [...currentSeats, seatNumber],
        };
      }
    });
  };

  const handleBooking = async (showId: string) => {
    if (!isAuthenticated || !user) {
      alert("Please login to book tickets");
      return;
    }

    const seats = selectedSeats[showId] || [];
    if (seats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    setBookingLoading(showId);
    try {
      const success = await createBooking(showId, seats, user.id);
      if (success) {
        setSelectedSeats((prev) => ({ ...prev, [showId]: [] }));
        alert("Booking successful!");
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      alert("Booking failed. Please try again.");
    } finally {
      setBookingLoading(null);
    }
  };

  const renderSeatGrid = (show: any) => {
    const seats = Array.from({ length: show.totalSeats }, (_, i) => i + 1);
    const selectedForShow = selectedSeats[show.id] || [];

    return (
      <div className="grid grid-cols-8 gap-1 p-4 bg-muted/50 rounded-lg">
        {seats.map((seatNumber) => {
          const isBooked = show.bookedSeats.includes(seatNumber);
          const isSelected = selectedForShow.includes(seatNumber);

          return (
            <button
              key={seatNumber}
              onClick={() =>
                !isBooked && handleSeatSelection(show.id, seatNumber)
              }
              disabled={isBooked}
              className={`
                w-8 h-8 text-xs rounded border transition-colors
                ${
                  isBooked
                    ? "bg-destructive text-destructive-foreground cursor-not-allowed"
                    : isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent border-border"
                }
              `}
            >
              {seatNumber}
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading shows...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Available Shows</h1>
          <p className="text-muted-foreground">
            Book your tickets for upcoming shows and trips
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">
            Search shows
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "show" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("show")}
          >
            Shows
          </Button>
          <Button
            variant={filterType === "trip" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("trip")}
          >
            Trips
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Shows Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {filteredShows.map((show) => (
          <Card key={show.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{show.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(show.startTime), "MMM dd, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(show.startTime), "hh:mm a")}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant={show.type === "trip" ? "secondary" : "default"}>
                  {show.type === "trip" ? "Trip" : "Show"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {show.totalSeats - show.bookedSeats.length} /{" "}
                  {show.totalSeats} available
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <DollarSign className="h-4 w-4" />$
                  {(Number(show.price) || 0).toFixed(2)}
                </span>
              </div>
              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Event Type:</span>
                  <Badge
                    variant={show.type === "trip" ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {show.type === "trip" ? "Bus Trip" : "Theater Show"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    Total {show.type === "trip" ? "Bus Capacity" : "Seats"}:
                  </span>
                  <span className="font-medium">{show.totalSeats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    Price per {show.type === "trip" ? "Ticket" : "Seat"}:
                  </span>
                  <span className="font-medium">
                    ${(Number(show.price) || 0).toFixed(2)}
                  </span>
                </div>
                {show.bookedSeats && show.bookedSeats.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Already Booked:</span>
                    <span className="font-medium">
                      {show.bookedSeats.length}{" "}
                      {show.type === "trip" ? "tickets" : "seats"}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Seat Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Seats</Label>
                  {selectedSeats[show.id]?.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {selectedSeats[show.id].length} seat(s) selected
                    </span>
                  )}
                </div>

                {renderSeatGrid(show)}

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-background border border-border rounded"></div>
                    Available
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-primary rounded"></div>
                    Selected
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-destructive rounded"></div>
                    Booked
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              <Button
                onClick={() => handleBooking(show.id)}
                disabled={
                  !isAuthenticated ||
                  bookingLoading === show.id ||
                  (selectedSeats[show.id]?.length || 0) === 0
                }
                className="w-full"
              >
                {bookingLoading === show.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : !isAuthenticated ? (
                  "Login to Book"
                ) : (selectedSeats[show.id]?.length || 0) === 0 ? (
                  "Select Seats to Book"
                ) : (
                  `Book ${selectedSeats[show.id]?.length || 0} Seat(s) - $${
                    (selectedSeats[show.id]?.length || 0) * (Number(show.price) || 0)
                  }`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredShows.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No shows found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Check back later for new shows and trips"}
          </p>
        </div>
      )}
    </div>
  );
}
