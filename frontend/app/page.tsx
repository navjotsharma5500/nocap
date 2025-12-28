"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else {
        // Redirect to appropriate dashboard based on role
        const roleRoutes: Record<string, string> = {
          STUDENT: "/student",
          SOCIETY_EB: "/eb",
          SOCIETY_PRESIDENT: "/president",
          FACULTY_ADMIN: "/admin",
          GUARD: "/guard",
        }
        router.push(roleRoutes[user.role] || "/login")
      }
    }
  }, [user, isLoading, router])

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Loading CampusPass...</p>
      </div>
    </div>
  )
}
