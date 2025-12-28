"use client"

import { Shield, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function AppNav() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const getRoleBadge = () => {
        if (!user) return null

        const roleLabels: Record<string, { label: string; style: string }> = {
            STUDENT: { label: "Student", style: "bg-black text-white" },
            SOCIETY_EB: { label: `EB - ${user.societyName || "Society"}`, style: "bg-gray-800 text-white" },
            SOCIETY_PRESIDENT: { label: `President - ${user.societyName || "Society"}`, style: "bg-gray-700 text-white" },
            FACULTY_ADMIN: { label: "Faculty Admin", style: "bg-gray-900 text-white" },
            GUARD: { label: "Security Guard", style: "bg-gray-600 text-white" },
        }

        const role = roleLabels[user.role] || { label: user.role, style: "bg-gray-500 text-white" }

        return (
            <span className={`${role.style} text-xs px-2.5 py-1 rounded-full font-medium`}>
                {role.label}
            </span>
        )
    }

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">CampusPass</h1>
                            <p className="text-xs text-muted-foreground">Multi-Actor Permission System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                {getRoleBadge()}

                                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>{user.name}</span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
