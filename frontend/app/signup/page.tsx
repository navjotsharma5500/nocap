"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, User, Hash, Building, Users, CheckCircle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const hostels = [
    "Hostel A", "Hostel B", "Hostel C", "Hostel D", "Hostel E", "Hostel F",
    "Hostel G", "Hostel H", "Hostel I", "Hostel J", "Hostel K", "Hostel L", "Hostel M", "Hostel N", "Hostel O"
]

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        rollNo: "",
        year: "",
        branch: "",
        hostel: "",
        gender: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const expectedPassword = formData.name ? `${formData.name.split(' ')[0].toLowerCase()}@tiet1` : ""

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        // Validate password format
        if (formData.password !== expectedPassword) {
            setError(`Password must be: ${expectedPassword}`)
            setIsLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_BASE}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    rollNo: formData.rollNo,
                    year: formData.year,
                    branch: formData.branch,
                    hostel: formData.hostel,
                    gender: formData.gender,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Registration failed")
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err: any) {
            setError(err.message || "Registration failed")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                    <p className="text-gray-400">Redirecting to login...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">CampusPass</h1>
                        <p className="text-sm text-gray-400">Student Registration</p>
                    </div>
                </div>

                {/* Signup Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">
                        Create your account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your.email@thapar.edu"
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Roll No */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Roll Number</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="rollNo"
                                    value={formData.rollNo}
                                    onChange={handleChange}
                                    placeholder="e.g. 102103456"
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Year & Branch */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                >
                                    <option value="" className="bg-gray-900">Select Year</option>
                                    <option value="1" className="bg-gray-900">1st Year</option>
                                    <option value="2" className="bg-gray-900">2nd Year</option>
                                    <option value="3" className="bg-gray-900">3rd Year</option>
                                    <option value="4" className="bg-gray-900">4th Year</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Branch</label>
                                <select
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                >
                                    <option value="" className="bg-gray-900">Select Branch</option>
                                    <option value="CSE" className="bg-gray-900">CSE</option>
                                    <option value="ECE" className="bg-gray-900">ECE</option>
                                    <option value="EE" className="bg-gray-900">EE</option>
                                    <option value="MECH" className="bg-gray-900">MECH</option>
                                    <option value="CIVIL" className="bg-gray-900">CIVIL</option>
                                    <option value="IT" className="bg-gray-900">IT</option>
                                    <option value="COE" className="bg-gray-900">COE</option>
                                </select>
                            </div>
                        </div>

                        {/* Hostel & Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Hostel</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <select
                                        name="hostel"
                                        value={formData.hostel}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                        required
                                    >
                                        <option value="" className="bg-gray-900">Select Hostel</option>
                                        {hostels.map(h => (
                                            <option key={h} value={h} className="bg-gray-900">{h}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Gender</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                        required
                                    >
                                        <option value="" className="bg-gray-900">Select</option>
                                        <option value="Male" className="bg-gray-900">Male</option>
                                        <option value="Female" className="bg-gray-900">Female</option>
                                        <option value="Other" className="bg-gray-900">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Password Info */}
                        {formData.name && (
                            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-300">
                                    <strong>Password must be:</strong> {expectedPassword}
                                </p>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
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

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-gray-400 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-white hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="text-center text-gray-600 text-sm mt-6">
                    © 2024 CampusPass. All rights reserved.
                </p>
            </div>
        </div>
    )
}
