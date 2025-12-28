"use client"

import ProtectedRoute from "@/components/protected-route"
import SocietyEBDashboard from "@/components/views/society-eb-dashboard"
import { useAuth } from "@/lib/auth-context"
import AppNav from "@/components/app-nav"

export default function EBPage() {
    const { user } = useAuth()

    return (
        <ProtectedRoute allowedRoles={["SOCIETY_EB"]}>
            <div className="min-h-screen bg-background">
                <AppNav />
                <main className="pt-16">
                    <SocietyEBDashboard
                        societyId={user?.societyId}
                        societyName={user?.societyName}
                    />
                </main>
            </div>
        </ProtectedRoute>
    )
}
