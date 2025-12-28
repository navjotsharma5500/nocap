"use client"

import ProtectedRoute from "@/components/protected-route"
import AdminDashboard from "@/components/views/admin-dashboard"
import AppNav from "@/components/app-nav"

export default function AdminPage() {
    return (
        <ProtectedRoute allowedRoles={["FACULTY_ADMIN"]}>
            <div className="min-h-screen bg-background">
                <AppNav />
                <main className="pt-16">
                    <AdminDashboard />
                </main>
            </div>
        </ProtectedRoute>
    )
}
