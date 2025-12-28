"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface User {
    id: string
    email: string
    name: string
    role: "STUDENT" | "SOCIETY_EB" | "SOCIETY_PRESIDENT" | "FACULTY_ADMIN" | "GUARD"
    rollNo?: string
    societyId?: string
    societyName?: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("campuspass_token")
        const storedUser = localStorage.getItem("campuspass_user")

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                return { success: false, error: data.error || "Login failed" }
            }

            // Store token and user
            localStorage.setItem("campuspass_token", data.token)
            localStorage.setItem("campuspass_user", JSON.stringify(data.user))

            setToken(data.token)
            setUser(data.user)

            return { success: true }
        } catch (error) {
            console.error("Login error:", error)
            return { success: false, error: "Network error. Please try again." }
        }
    }

    const logout = () => {
        localStorage.removeItem("campuspass_token")
        localStorage.removeItem("campuspass_user")
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

// Helper to get auth header for API calls
export function getAuthHeader(token: string | null) {
    return token ? { Authorization: `Bearer ${token}` } : {}
}
