"use client"

import ProtectedRoute from "@/components/protected-route"
import StudentView from "@/components/views/student-view"
import { useAuth } from "@/lib/auth-context"
import AppNav from "@/components/app-nav"

export default function StudentPage() {
    const { user } = useAuth()

    return (
        <ProtectedRoute allowedRoles={["STUDENT"]}>
            <div className="min-h-screen bg-background">
                <AppNav />
                <main className="pt-16">
                    <StudentView studentId={user?.id} />
                </main>
            </div>
        </ProtectedRoute>
    )
}
