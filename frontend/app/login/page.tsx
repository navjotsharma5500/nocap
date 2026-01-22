"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { login, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user) {
            const roleRoutes: Record<string, string> = {
                STUDENT: "/student",
                SOCIETY_EB: "/eb",
                SOCIETY_PRESIDENT: "/president",
                FACULTY_ADMIN: "/admin",
                GUARD: "/guard",
            }
            router.push(roleRoutes[user.role] || "/student")
        }
    }, [user, router])

    // Redirect if already logged in
    if (user) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        const result = await login(email, password)

        if (result.success) {
            // Get updated user from context after login
            const storedUser = localStorage.getItem("campuspass_user")
            if (storedUser) {
                const user = JSON.parse(storedUser)
                const roleRoutes: Record<string, string> = {
                    STUDENT: "/student",
                    SOCIETY_EB: "/eb",
                    SOCIETY_PRESIDENT: "/president",
                    FACULTY_ADMIN: "/admin",
                    GUARD: "/guard",
                }
                router.push(roleRoutes[user.role] || "/student")
            }
        } else {
            setError(result.error || "Login failed")
        }
        setIsLoading(false)
    }

    const testAccounts = [
        { label: "EB (URJA)", email: "harsh.shrivas@thapar.edu", password: "eburja@tiet1" },
        { label: "EB (CCS)", email: "manish.tiwari@thapar.edu", password: "ebccs@tiet1" },
        { label: "President", email: "mohit.arora@thapar.edu", password: "eburja@tiet1" },
        { label: "Admin", email: "admin@thapar.edu", password: "admin@tiet1" },
        { label: "Guard", email: "guard1@thapar.edu", password: "guard@tiet1" },
    ]

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">CampusPass</h1>
                        <p className="text-sm text-gray-400">Multi-Actor Permission System</p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">
                        Sign in to your account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-white/10 border border-white/20 rounded-lg text-gray-300 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-gray-400 text-sm">
                        New student?{" "}
                        <Link href="/signup" className="text-white hover:underline font-medium">
                            Create an account
                        </Link>
                    </p>

                    {/* Test Accounts */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-gray-500 text-center mb-3">Quick Login (Demo)</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {testAccounts.map((account) => (
                                <button
                                    key={account.email}
                                    onClick={() => {
                                        setEmail(account.email)
                                        setPassword(account.password)
                                    }}
                                    className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-gray-300 rounded-full transition"
                                >
                                    {account.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-600 text-sm mt-6">
                    © 2024 CampusPass. All rights reserved.
                </p>
            </div>
        </div>
    )
}

