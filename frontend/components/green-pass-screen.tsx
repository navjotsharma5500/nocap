"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GreenPassScreenProps {
  elapsedSeconds: number
  onBack: () => void
}

export default function GreenPassScreen({ elapsedSeconds, onBack }: GreenPassScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 bg-green-500 z-40 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Back Button */}
      <Button onClick={onBack} variant="ghost" className="absolute top-4 left-4 text-white hover:bg-green-600">
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="w-full h-full flex flex-col items-center justify-center gap-8 max-w-md">
        {/* Student Photo Placeholder */}
        <div className="w-32 h-40 bg-white/90 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <svg className="w-16 h-16 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Authorization Text */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl text-balance">
            AUTHORIZED
            <br />
            TO LEAVE
          </h1>
          <p className="text-lg text-white/90 font-semibold">Raj Kumar Singh</p>
          <p className="text-sm text-white/80">Roll: CS21B034 | Hostel: B-Block</p>
        </div>

        {/* Animated Clock (Proof of Live) */}
        <div className="bg-white text-green-500 rounded-full p-8 shadow-2xl pulse-glow">
          <div className="text-center">
            <p className="text-xs text-green-600 font-semibold mb-1">Active Since</p>
            <p className="text-4xl font-mono font-black">{formatTime(elapsedSeconds)}</p>
            <p className="text-xs text-green-600 mt-1">⏱ Ticking clock proof</p>
          </div>
        </div>

        {/* Valid Until */}
        <div className="text-center text-white">
          <p className="text-sm opacity-90">Valid Until: 2:00 AM</p>
          <p className="text-xs opacity-75 mt-1">This is a live pass. Screenshot not valid.</p>
        </div>

        {/* Footer Info */}
        <div className="w-full bg-white/20 backdrop-blur p-4 rounded-lg text-white text-center">
          <p className="text-xs">Show this to guards at any checkpoint</p>
          <p className="text-xs mt-1">Your data is verified in real-time</p>
        </div>
      </div>
    </div>
  )
}
