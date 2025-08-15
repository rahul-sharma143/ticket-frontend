"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useBooking } from "@/contexts/booking-context"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, RefreshCw, Search, Filter, Calendar, Clock } from "lucide-react"

export function ShowList() {
  const { shows, loading, error, refreshShows, clearError } = useBooking()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "price" | "availability">("date")
  const [filterBy, setFilterBy] = useState<"all" | "available" | "filling-fast">("all")

  const filteredAndSortedShows = shows
    .filter((show) => {
      // Search filter
      const matchesSearch = show.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Availability filter
      const availableSeats = show.totalSeats - show.bookedSeats.length
      let matchesFilter = true

      if (filterBy === "available") {
        matchesFilter = availableSeats > 0
      } else if (filterBy === "filling-fast") {
        matchesFilter = availableSeats > 0 && availableSeats <= show.totalSeats * 0.2 // Less than 20% available
      }

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      const aAvailable = a.totalSeats - a.bookedSeats.length
      const bAvailable = b.totalSeats - b.bookedSeats.length

      switch (sortBy) {
        case "date":
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        case "price":
          return a.price - b.price
        case "availability":
          return bAvailable - aAvailable // Most available first
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading shows...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Available Shows & Trips</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! Find and book your perfect show or trip.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {filteredAndSortedShows.length} of {shows.length} shows
          </Badge>
          <Button variant="outline" size="sm" onClick={refreshShows} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search shows and trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: "date" | "price" | "availability") => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="availability">Availability</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterBy}
                onValueChange={(value: "all" | "available" | "filling-fast") => setFilterBy(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shows</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="filling-fast">Filling Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAndSortedShows.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchTerm || filterBy !== "all"
                  ? "No shows match your search criteria."
                  : "No shows available at the moment."}
              </p>
              {(searchTerm || filterBy !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterBy("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
              {!searchTerm && filterBy === "all" && (
                <Button variant="outline" className="mt-4 bg-transparent" onClick={refreshShows}>
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedShows.map((show) => {
            const availableSeats = show.totalSeats - show.bookedSeats.length
            const isFillingFast = availableSeats <= show.totalSeats * 0.2 && availableSeats > 0
            const startDate = new Date(show.startTime)
            const isUpcoming = startDate > new Date()

            return (
              <Card key={show.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl leading-tight">{show.name}</CardTitle>
                    {isFillingFast && (
                      <Badge variant="destructive" className="text-xs">
                        Filling Fast!
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {startDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Available:</span>
                      <div className="flex items-center mt-1">
                        <Badge
                          variant={availableSeats > 10 ? "default" : availableSeats > 0 ? "secondary" : "destructive"}
                        >
                          {availableSeats}/{show.totalSeats}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <div className="font-bold text-lg mt-1">${show.price}</div>
                    </div>
                  </div>

                  <Link href={`/booking/${show.id}`}>
                    <Button
                      className="w-full"
                      disabled={availableSeats === 0 || !isUpcoming}
                      variant={isFillingFast ? "default" : "default"}
                    >
                      {!isUpcoming
                        ? "Event Passed"
                        : availableSeats === 0
                          ? "Sold Out"
                          : isFillingFast
                            ? "Book Now - Limited Seats!"
                            : "Book Seats"}
                    </Button>
                  </Link>

                  {!isUpcoming && (
                    <p className="text-xs text-muted-foreground text-center">This event has already started</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
