"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VerifiedPassScreenProps {
  studentData: {
    name: string
    rollNo: string
    hostel: string
    qrToken: string
    validUntil: string
    reason?: string
    exitTime?: string
  }
  onBack: () => void
}

export default function VerifiedPassScreen({ studentData, onBack }: VerifiedPassScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Prevent screenshots and context menu
  useEffect(() => {
    const preventScreenshot = (e: Event) => {
      e.preventDefault()
      return false
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Detect PrintScreen key
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('')
        alert('Screenshots are disabled for security reasons')
      }
    }

    document.addEventListener('contextmenu', preventScreenshot)
    document.addEventListener('keyup', handleKeyUp)

    // Prevent screenshot on mobile (limited effectiveness)
    document.body.style.webkitUserSelect = 'none'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('contextmenu', preventScreenshot)
      document.removeEventListener('keyup', handleKeyUp)
      document.body.style.webkitUserSelect = ''
      document.body.style.userSelect = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 z-50 flex flex-col items-center justify-center p-4 select-none overflow-y-auto">
      {/* Animated watermark overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="text-white text-8xl md:text-9xl font-black rotate-45 animate-pulse">
          LIVE
        </div>
      </div>

      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-green-700 z-10"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="w-full max-w-md space-y-6 relative z-10 py-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl">
            AUTHORIZED
          </h1>
          <p className="text-white/90 text-sm font-semibold">Student Night Exit Pass</p>
        </div>

        {/* QR Code Card - Main Feature */}
        <div className="bg-white p-6 rounded-3xl shadow-2xl space-y-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl flex items-center justify-center border-4 border-green-500">
            <QRCodeSVG
              value={studentData.qrToken}
              size={220}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          
          {/* Live Timestamp - Anti-Screenshot Measure */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 text-center shadow-inner">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-600 animate-pulse" />
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Live Verification</p>
            </div>
            <p className="text-3xl font-mono font-black text-green-600 tabular-nums">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-xs text-green-600 mt-1 font-semibold">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Student Info */}
          <div className="space-y-3 text-center border-t-2 border-gray-200 pt-4">
            <div>
              <p className="text-xl font-bold text-gray-800">{studentData.name}</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Roll: {studentData.rollNo}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-600 font-semibold">Hostel</p>
                <p className="font-bold text-blue-800">{studentData.hostel}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                <p className="text-xs text-purple-600 font-semibold">Exit Time</p>
                <p className="font-bold text-purple-800">{studentData.exitTime || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          {studentData.reason && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-semibold mb-1">Reason for Exit</p>
              <p className="text-sm text-amber-900 font-medium">{studentData.reason}</p>
            </div>
          )}

          {/* Valid Until */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-700 font-bold mb-1 uppercase tracking-wide">Valid Until</p>
            <p className="text-lg font-black text-blue-800">{studentData.validUntil}</p>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 text-center space-y-3 border-2 border-white/30 shadow-xl">
          <p className="text-white text-base font-black uppercase tracking-wide">
            ⚠️ Anti-Fraud Notice
          </p>
          <p className="text-white/95 text-sm font-semibold leading-relaxed">
            This is a LIVE pass with real-time verification. Screenshots and photos are INVALID and will be flagged by the system.
          </p>
          <div className="bg-white/10 rounded-lg p-2 mt-2">
            <p className="text-white/90 text-xs font-medium">
              🔒 Show QR code to guard scanner at gate checkpoint
            </p>
          </div>
        </div>

        {/* Security Features Notice */}
        <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-3 text-center border border-red-300">
          <p className="text-white text-xs font-semibold">
            ⏱️ Real-time clock • 🚫 Screenshot detection • 🔐 JWT encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
