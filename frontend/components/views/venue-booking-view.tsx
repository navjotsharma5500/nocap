"use client"

import { useState } from "react"
import { MapPin, Calendar, Clock, Users, ChevronLeft, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const venues = [
  { id: "v1", name: "Main Auditorium", capacity: 500, type: "Indoor", amenities: ["Stage", "AV System", "AC"] },
  { id: "v2", name: "Open Air Theatre", capacity: 1000, type: "Outdoor", amenities: ["Stage", "Lighting"] },
  { id: "v3", name: "Seminar Hall A", capacity: 150, type: "Indoor", amenities: ["Projector", "AC", "Mic System"] },
  { id: "v4", name: "Seminar Hall B", capacity: 100, type: "Indoor", amenities: ["Projector", "AC"] },
  { id: "v5", name: "Sports Complex", capacity: 2000, type: "Indoor", amenities: ["Court", "Seating", "Lighting"] },
  { id: "v6", name: "Central Lawn", capacity: 800, type: "Outdoor", amenities: ["Open Space", "Power Outlets"] },
]

const eventTypes = [
  "Cultural Event",
  "Technical Workshop",
  "Guest Lecture",
  "Sports Event",
  "Competition",
  "Annual Fest",
  "Orientation",
  "Other",
]

export default function VenueBookingView() {
  const [currentScreen, setCurrentScreen] = useState<"list" | "book">("list")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [eventName, setEventName] = useState("")
  const [eventType, setEventType] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [expectedAttendees, setExpectedAttendees] = useState("")
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState<string[]>([])

  const [bookings, setBookings] = useState([
    {
      id: "e1",
      eventName: "Tech Fest 2025",
      venue: "Main Auditorium",
      date: "2025-12-15",
      time: "6:00 PM - 10:00 PM",
      status: "approved",
      society: "Tech Club",
      attendees: 400,
    },
    {
      id: "e2",
      eventName: "Hackathon Opening",
      venue: "Seminar Hall A",
      date: "2025-12-10",
      time: "9:00 AM - 12:00 PM",
      status: "pending",
      society: "Coding Club",
      attendees: 120,
    },
    {
      id: "e3",
      eventName: "Music Night",
      venue: "Open Air Theatre",
      date: "2025-12-08",
      time: "7:00 PM - 11:00 PM",
      status: "pending",
      society: "Music Club",
      attendees: 600,
    },
    {
      id: "e4",
      eventName: "Debate Competition",
      venue: "Seminar Hall B",
      date: "2025-12-05",
      time: "2:00 PM - 6:00 PM",
      status: "rejected",
      society: "Debate Society",
      attendees: 80,
    },
  ])

  const additionalRequirements = [
    { id: "av", label: "AV Equipment" },
    { id: "chairs", label: "Extra Chairs" },
    { id: "security", label: "Security Personnel" },
    { id: "catering", label: "Catering Space" },
    { id: "parking", label: "Parking Arrangements" },
    { id: "power", label: "Extra Power Supply" },
  ]

  const handleSubmit = () => {
    if (!selectedVenue || !eventName || !eventDate || !startTime || !endTime) return

    const venue = venues.find((v) => v.id === selectedVenue)
    const newBooking = {
      id: `e${Date.now()}`,
      eventName,
      venue: venue?.name || "",
      date: eventDate,
      time: `${startTime} - ${endTime}`,
      status: "pending",
      society: "My Society",
      attendees: Number.parseInt(expectedAttendees) || 0,
    }
    setBookings((prev) => [newBooking, ...prev])
    setCurrentScreen("list")
    // Reset form
    setSelectedVenue("")
    setEventName("")
    setEventType("")
    setEventDate("")
    setStartTime("")
    setEndTime("")
    setExpectedAttendees("")
    setDescription("")
    setRequirements([])
  }

  const toggleRequirement = (id: string) => {
    setRequirements((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  if (currentScreen === "book") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setCurrentScreen("list")} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Request Event Venue
              </CardTitle>
              <CardDescription>Submit a venue booking request for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Event Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Name</label>
                    <Input
                      placeholder="e.g., Annual Tech Fest"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Type</label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Event Description</label>
                  <Textarea
                    placeholder="Describe your event, its purpose, and any special considerations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Venue Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Venue Selection</h3>

                <div>
                  <label className="text-sm font-medium mb-2 block">Select Venue</label>
                  <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a venue..." />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{venue.name}</span>
                            <span className="text-muted-foreground text-xs">
                              ({venue.type}, Cap: {venue.capacity})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVenue && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {(() => {
                      const venue = venues.find((v) => v.id === selectedVenue)
                      return venue ? (
                        <div>
                          <p className="font-medium text-primary">{venue.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {venue.type} | Capacity: {venue.capacity}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {venue.amenities.map((a) => (
                              <Badge key={a} variant="secondary" className="text-xs">
                                {a}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Date & Time</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date</label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Time</label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Time</label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Expected Attendees</label>
                  <Input
                    type="number"
                    placeholder="e.g., 200"
                    value={expectedAttendees}
                    onChange={(e) => setExpectedAttendees(e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Additional Requirements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {additionalRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:border-primary/50 cursor-pointer"
                      onClick={() => toggleRequirement(req.id)}
                    >
                      <Checkbox checked={requirements.includes(req.id)} />
                      <span className="text-sm">{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full" size="lg">
                Submit Venue Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Event Venue Booking
            </h1>
            <p className="text-muted-foreground">Request venue permissions for events and activities</p>
          </div>
          <Button onClick={() => setCurrentScreen("book")} className="gap-2">
            <Megaphone className="w-4 h-4" />
            New Venue Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-primary">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">
                {bookings.filter((b) => b.status === "pending").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-700">
                {bookings.filter((b) => b.status === "approved").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-700">
                {bookings.filter((b) => b.status === "rejected").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Venues */}
        <Card>
          <CardHeader>
            <CardTitle>Available Venues</CardTitle>
            <CardDescription>Campus venues available for booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedVenue(venue.id)
                    setCurrentScreen("book")
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {venue.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {venue.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Users className="w-4 h-4" />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {venue.amenities.slice(0, 3).map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Event Requests</CardTitle>
            <CardDescription>Your venue booking requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{booking.eventName}</p>
                      <p className="text-sm text-muted-foreground">{booking.venue}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {booking.attendees} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{booking.society}</span>
                    <Badge
                      variant={
                        booking.status === "approved"
                          ? "default"
                          : booking.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className={booking.status === "approved" ? "bg-green-600" : ""}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
