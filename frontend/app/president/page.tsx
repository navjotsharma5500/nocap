"use client"

import ProtectedRoute from "@/components/protected-route"
import SocietyPresidentDashboard from "@/components/views/society-president-dashboard"
import { useAuth } from "@/lib/auth-context"
import AppNav from "@/components/app-nav"

export default function PresidentPage() {
    const { user } = useAuth()

    return (
        <ProtectedRoute allowedRoles={["SOCIETY_PRESIDENT"]}>
            <div className="min-h-screen bg-background">
                <AppNav />
                <main className="pt-16">
                    <SocietyPresidentDashboard
                        societyId={user?.societyId}
                        societyName={user?.societyName}
                    />
                </main>
            </div>
        </ProtectedRoute>
    )
}
