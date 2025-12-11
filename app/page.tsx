"use client"

import { useState } from "react"
import RoleNav from "@/components/role-nav"
import StudentView from "@/components/views/student-view"
import SocietyEBDashboard from "@/components/views/society-eb-dashboard"
import SocietyPresidentDashboard from "@/components/views/society-president-dashboard"
import AdminDashboard from "@/components/views/admin-dashboard"
import GuardInterface from "@/components/views/guard-interface"
import RoomBookingView from "@/components/views/room-booking-view"
import VenueBookingView from "@/components/views/venue-booking-view"

type UserRole =
  | "Student"
  | "Society_EB"
  | "Society_President"
  | "Faculty_Admin"
  | "Guard"
  | "Room_Booking"
  | "Venue_Booking"

export default function Home() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("Student")

  const renderView = () => {
    switch (currentUserRole) {
      case "Student":
        return <StudentView />
      case "Society_EB":
        return <SocietyEBDashboard />
      case "Society_President":
        return <SocietyPresidentDashboard />
      case "Faculty_Admin":
        return <AdminDashboard />
      case "Guard":
        return <GuardInterface />
      case "Room_Booking":
        return <RoomBookingView />
      case "Venue_Booking":
        return <VenueBookingView />
      default:
        return <StudentView />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleNav currentRole={currentUserRole} onRoleChange={setCurrentUserRole} />
      <main className="pt-16">{renderView()}</main>
    </div>
  )
}
