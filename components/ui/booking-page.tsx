"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBooking } from "@/contexts/booking-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

export function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { shows, createBooking, loading } = useBooking()

  const showId = params.id as string
  const show = shows.find((s) => s.id === showId)

  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  })

  useEffect(() => {
    if (!show && !loading) {
      router.push("/")
    }
  }, [show, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading show details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Show Not Found</h1>
          <p className="text-muted-foreground">The show you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shows
          </Button>
        </div>
      </div>
    )
  }

  const handleSeatClick = (seatNumber: number) => {
    if (show.bookedSeats.includes(seatNumber)) return

    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber],
    )
  }

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return

    try {
      await createBooking(showId, selectedSeats, customerInfo.email || "guest@example.com")
      router.push("/")
    } catch (error) {
      console.error("Booking failed:", error)
    }
  }

  const totalAmount = selectedSeats.length * show.price
  const availableSeats = show.totalSeats - show.bookedSeats.length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shows
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{show.name}</h1>
          <p className="text-muted-foreground">Book your tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Show Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Show Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(show.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{availableSeats} seats available</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">${show.price} per ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Main Theater</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Your Seats</CardTitle>
              <CardDescription>
                Click on available seats to select them. Selected seats are highlighted in blue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded border"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded border"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded border"></div>
                    <span>Booked</span>
                  </div>
                </div>

                <div className="text-center text-sm font-medium text-muted-foreground mb-4">SCREEN</div>

                <div className="grid grid-cols-10 gap-2 max-w-md mx-auto">
                  {Array.from({ length: show.totalSeats }, (_, i) => i + 1).map((seatNumber) => {
                    const isBooked = show.bookedSeats.includes(seatNumber)
                    const isSelected = selectedSeats.includes(seatNumber)

                    return (
                      <button
                        key={seatNumber}
                        onClick={() => handleSeatClick(seatNumber)}
                        disabled={isBooked}
                        className={cn(
                          "w-8 h-8 text-xs font-medium rounded border transition-colors",
                          isBooked && "bg-red-500 text-white cursor-not-allowed",
                          isSelected && "bg-blue-500 text-white",
                          !isBooked && !isSelected && "bg-gray-200 hover:bg-gray-300",
                        )}
                      >
                        {seatNumber}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Show:</span>
                  <span className="font-medium">{show.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date & Time:</span>
                  <span>{new Date(show.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Selected Seats:</span>
                  <span className="font-medium">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ticket Price:</span>
                  <span>${show.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span>{selectedSeats.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>${totalAmount}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || loading || !customerInfo.email}
              >
                {loading
                  ? "Processing..."
                  : `Book ${selectedSeats.length} Ticket${selectedSeats.length !== 1 ? "s" : ""}`}
              </Button>

              {selectedSeats.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">Please select at least one seat to continue</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
