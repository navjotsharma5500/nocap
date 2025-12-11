"use client"

import { useState } from "react"
import { Building2, Calendar, Clock, Users, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const availableRooms = [
  { id: "r1", name: "Discussion Room A", capacity: 8, building: "Academic Block", floor: "Ground" },
  { id: "r2", name: "Discussion Room B", capacity: 10, building: "Academic Block", floor: "1st" },
  { id: "r3", name: "Study Hall 1", capacity: 25, building: "Library", floor: "2nd" },
  { id: "r4", name: "Meeting Room 101", capacity: 15, building: "Admin Block", floor: "1st" },
  { id: "r5", name: "Project Lab", capacity: 20, building: "Tech Center", floor: "Ground" },
]

const timeSlots = [
  "8:00 PM - 10:00 PM",
  "10:00 PM - 12:00 AM",
  "12:00 AM - 2:00 AM",
  "2:00 AM - 4:00 AM",
  "4:00 AM - 6:00 AM",
]

export default function RoomBookingView() {
  const [currentScreen, setCurrentScreen] = useState<"list" | "book" | "history">("list")
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [reason, setReason] = useState("")
  const [attendees, setAttendees] = useState("")

  const [bookings, setBookings] = useState([
    {
      id: "b1",
      room: "Discussion Room A",
      date: "2025-12-05",
      slot: "10:00 PM - 12:00 AM",
      status: "approved",
      reason: "Project Discussion",
    },
    {
      id: "b2",
      room: "Study Hall 1",
      date: "2025-12-03",
      slot: "8:00 PM - 10:00 PM",
      status: "pending",
      reason: "Study Group",
    },
    {
      id: "b3",
      room: "Meeting Room 101",
      date: "2025-12-02",
      slot: "12:00 AM - 2:00 AM",
      status: "rejected",
      reason: "Late Night Planning",
    },
  ])

  const handleSubmit = () => {
    if (!selectedRoom || !selectedDate || !selectedSlot || !reason) return

    const room = availableRooms.find((r) => r.id === selectedRoom)
    const newBooking = {
      id: `b${Date.now()}`,
      room: room?.name || "",
      date: selectedDate,
      slot: selectedSlot,
      status: "pending",
      reason,
    }
    setBookings((prev) => [newBooking, ...prev])
    setCurrentScreen("list")
    setSelectedRoom("")
    setSelectedDate("")
    setSelectedSlot("")
    setReason("")
    setAttendees("")
  }

  if (currentScreen === "book") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setCurrentScreen("list")} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Book a Room
              </CardTitle>
              <CardDescription>Request a room for night-time activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Room</label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a room..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        <span className="font-medium">{room.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({room.building}, Capacity: {room.capacity})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Slot</label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time..." />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Number of Attendees</label>
                <Input
                  type="number"
                  placeholder="e.g., 5"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Purpose / Reason</label>
                <Textarea
                  placeholder="Describe the purpose of your booking..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" size="lg">
                Submit Booking Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Room Booking
            </h1>
            <p className="text-muted-foreground">Book rooms for night-time study sessions and activities</p>
          </div>
          <Button onClick={() => setCurrentScreen("book")} className="gap-2">
            <Calendar className="w-4 h-4" />
            New Booking
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
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
        </div>

        {/* Available Rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Available Rooms</CardTitle>
            <CardDescription>Rooms available for night-time booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedRoom(room.id)
                    setCurrentScreen("book")
                  }}
                >
                  <h3 className="font-semibold text-foreground">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {room.building} - {room.floor} Floor
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>Capacity: {room.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>Your room booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.room}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.slot}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{booking.reason}</p>
                    </div>
                  </div>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
