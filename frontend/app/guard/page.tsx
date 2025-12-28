"use client"

import ProtectedRoute from "@/components/protected-route"
import GuardInterface from "@/components/views/guard-interface"
import AppNav from "@/components/app-nav"

export default function GuardPage() {
    return (
        <ProtectedRoute allowedRoles={["GUARD"]}>
            <div className="min-h-screen bg-background">
                <AppNav />
                <main className="pt-16">
                    <GuardInterface />
                </main>
            </div>
        </ProtectedRoute>
    )
}
