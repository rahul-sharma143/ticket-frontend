"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useBooking } from "@/contexts/booking-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Users,
  DollarSign,
  Bus,
  Theater,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminDashboard() {
  const { shows, bookings, addShow, loading, error } = useBooking();
  const [eventType, setEventType] = useState<"show" | "trip">("show");
  const [newShow, setNewShow] = useState({
    name: "",
    startTime: "",
    totalSeats: 100,
    price: 25,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (submitError || submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitError(null);
        setSubmitSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitError, submitSuccess]);

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!newShow.name.trim() || !newShow.startTime) {
      setSubmitError("Please fill in all required fields");
      return;
    }
    if (newShow.totalSeats <= 0) {
      setSubmitError("Total seats must be greater than 0");
      return;
    }
    if (newShow.price < 0) {
      setSubmitError("Price cannot be negative");
      return;
    }
    const startDate = new Date(newShow.startTime);
    if (startDate < new Date()) {
      setSubmitError("Start time must be in the future");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addShow({
        name: newShow.name.trim(),
        startTime: newShow.startTime,
        totalSeats: newShow.totalSeats,
        price: newShow.price,
        type: eventType,
      });

      if (result) {
        setSubmitSuccess(
          `${eventType === "show" ? "Show" : "Trip"} "${
            newShow.name
          }" added successfully!`
        );
        setNewShow({ name: "", startTime: "", totalSeats: 100, price: 25 });
      } else {
        throw new Error("Failed to add event");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to add event. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRevenue = bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((sum, booking) => sum + booking.totalAmount, 0);

  const totalBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const showEvents = shows.filter((show) => show.type === "show");
  const tripEvents = shows.filter((show) => show.type === "trip");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">
          {showEvents.length} Shows • {tripEvents.length} Trips •{" "}
          {totalBookings} Bookings
        </Badge>
      </div>

      {(submitError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError || error}</AlertDescription>
        </Alert>
      )}

      {submitSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {submitSuccess}
          </AlertDescription>
        </Alert>
      )}

      {process.env.NODE_ENV === "development" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-800">
              Debug: {shows.length} total shows ({showEvents.length} shows,{" "}
              {tripEvents.length} trips), {bookings.length} bookings
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card key="total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(totalRevenue || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card key="total-bookings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
        <Card key="active-shows">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shows</CardTitle>
            <Theater className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{showEvents.length}</div>
          </CardContent>
        </Card>
        <Card key="active-trips">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger key="manage" value="manage">
            Manage Events
          </TabsTrigger>
          <TabsTrigger key="bookings" value="bookings">
            View Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          {/* Add New Show/Trip Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New {eventType === "show" ? "Show" : "Trip"}
              </CardTitle>
              <CardDescription>
                {eventType === "show"
                  ? "Create a new theater show or performance"
                  : "Create a new bus trip or journey"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddShow} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Select
                    value={eventType}
                    onValueChange={(value: "show" | "trip") => {
                      setEventType(value);
                      setNewShow((prev) => ({
                        ...prev,
                        totalSeats: value === "trip" ? 50 : 100,
                        price: value === "trip" ? 35 : 25,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show">
                        <div className="flex items-center gap-2">
                          <Theater className="h-4 w-4" /> Show
                        </div>
                      </SelectItem>
                      <SelectItem value="trip">
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4" /> Trip
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder={
                      eventType === "show" ? "Show name" : "Trip destination"
                    }
                    value={newShow.name}
                    onChange={(e) =>
                      setNewShow({ ...newShow, name: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    type="datetime-local"
                    value={newShow.startTime}
                    onChange={(e) =>
                      setNewShow({ ...newShow, startTime: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <Input
                    type="number"
                    placeholder={
                      eventType === "show" ? "Total seats" : "Bus capacity"
                    }
                    value={newShow.totalSeats}
                    onChange={(e) =>
                      setNewShow({
                        ...newShow,
                        totalSeats: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    min={1}
                    max={eventType === "trip" ? 60 : 500}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Price ($)"
                      value={newShow.price}
                      onChange={(e) =>
                        setNewShow({
                          ...newShow,
                          price: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      step={0.01}
                      required
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      disabled={loading || isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting
                        ? "Adding..."
                        : `Add ${eventType === "show" ? "Show" : "Trip"}`}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Shows Section */}
          {showEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Theater className="h-5 w-5" /> Theater Shows (
                  {showEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {showEvents.map((item, index) => (
                    <Card key={item.id ?? index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.startTime).toLocaleString()}
                            </p>
                            <p className="text-xs text-blue-600 font-medium">
                              Type: {item.type || "show"}
                            </p>
                            {item.bookedSeats &&
                              item.bookedSeats.length > 0 && (
                                <div className="flex gap-2 flex-wrap text-sm">
                                  <span className="text-muted-foreground">
                                    Booked seats:
                                  </span>
                                  {item.bookedSeats.map((seat, idx) => (
                                    <span
                                      key={`${item.id}-seat-${seat}-${idx}`}
                                      className="bg-muted px-2 py-1 rounded text-xs"
                                    >
                                      {seat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            <div className="flex gap-4 text-sm">
                              <span key={`${item.id}-total-seats`}>
                                Total Seats: {item.totalSeats}
                              </span>
                              <span key={`${item.id}-booked`}>
                                Booked: {item.bookedSeats?.length || 0}
                              </span>
                              <span key={`${item.id}-available`}>
                                Available:{" "}
                                {item.totalSeats -
                                  (item.bookedSeats?.length || 0)}
                              </span>
                              <span
                                key={`${item.id}-price`}
                                className="font-medium"
                              >
                                ${Number(item.price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">Show</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trips Section */}
          {tripEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" /> Bus Trips ({tripEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {tripEvents.map((trip) => (
                    <Card key={trip.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <Bus className="h-4 w-4" /> {trip.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(trip.startTime).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              Type: {trip.type}
                            </p>
                            {trip.bookedSeats &&
                              trip.bookedSeats.length > 0 && (
                                <div className="flex gap-2 flex-wrap text-sm">
                                  <span className="text-muted-foreground">
                                    Booked seats:
                                  </span>
                                  {trip.bookedSeats.map((seat, idx) => (
                                    <span
                                      key={`${trip.id}-seat-${seat}-${idx}`}
                                      className="bg-muted px-2 py-1 rounded text-xs"
                                    >
                                      {seat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            <div className="flex gap-4 text-sm">
                              <span key={`${trip.id}-capacity`}>
                                Bus Capacity: {trip.totalSeats}
                              </span>
                              <span key={`${trip.id}-booked`}>
                                Booked: {trip.bookedSeats?.length || 0}
                              </span>
                              <span key={`${trip.id}-available`}>
                                Available:{" "}
                                {trip.totalSeats -
                                  (trip.bookedSeats?.length || 0)}
                              </span>
                              <span
                                key={`${trip.id}-price`}
                                className="font-medium"
                              >
                                ${Number(trip.price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50">
                            Trip
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {shows.length === 0 && !loading && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  No shows or trips found. Create your first event above.
                </p>
              </CardContent>
            </Card>
          )}

          {loading && shows.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  Loading events...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                All booking transactions and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking, index) => {
                  const show = shows.find((s) => s.id === booking.showId);
                  // Use booking.id if available, otherwise fallback to booking.id + index, or just index
                  const uniqueKey =
                    booking.id ||
                    `booking-${booking.showId}-${booking.userId}-${index}`;

                  return (
                    <div
                      key={uniqueKey}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-2">
                          {show?.type === "trip" ? (
                            <Bus className="h-4 w-4" />
                          ) : (
                            <Theater className="h-4 w-4" />
                          )}
                          {show?.name || "Unknown Event"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seats: {booking.seats.join(", ")} • User:{" "}
                          {booking.userId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                        <p className="font-medium">
                          ${Number(booking.totalAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {bookings.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No bookings found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
