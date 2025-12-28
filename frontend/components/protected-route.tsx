"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login")
            } else if (!allowedRoles.includes(user.role)) {
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
    }, [user, isLoading, allowedRoles, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null
    }

    return <>{children}</>
}
