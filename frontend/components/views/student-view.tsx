"use client"

import { useState, useEffect } from "react"
import { QrCode, Clock, HistoryIcon, MapPin, Send, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import VerifiedPassScreen from "@/components/verified-pass-screen"
import WorkflowTracker from "@/components/workflow-tracker"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const STUDENT_ID = "student-001" // Replace with actual auth user ID
const SOCIETY_ID = "society-001" // Replace with student's society

export default function StudentView() {
  const [currentScreen, setCurrentScreen] = useState<"home" | "greenpass" | "history" | "new_request" | "track">("home")
  const [passActive, setPassActive] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [activePass, setActivePass] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch student's requests on mount
  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/permissions/student/${STUDENT_ID}`)
      const data = await response.json()
      setMyRequests(data)
      
      // Check for approved pass with QR token
      const approved = data.find((r: any) => r.status === 'APPROVED' && r.qrToken)
      if (approved) {
        setActivePass(approved)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!passActive) return
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [passActive])

  const handleQRScan = () => {
    setPassActive(true)
    setElapsedSeconds(0)
    setCurrentScreen("greenpass")
  }

  const handleBackHome = () => {
    setCurrentScreen("home")
    setPassActive(false)
  }

  const handleNewRequest = async (reason: string, date: string) => {
    try {
      const response = await fetch(`${API_URL}/api/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: STUDENT_ID,
          societyId: SOCIETY_ID,
          reason,
          date,
          exitTime: '20:00',
          returnTime: '23:00',
        }),
      })
      
      if (response.ok) {
        await fetchRequests() // Refresh list
        setCurrentScreen("track")
      } else {
        alert('Failed to submit request')
      }
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('Failed to submit request')
    }
  }

  if (currentScreen === "greenpass" && passActive && activePass) {
    return (
      <VerifiedPassScreen
        studentData={{
          name: activePass.student?.name || "Student",
          rollNo: activePass.student?.rollNo || "N/A",
          hostel: "B-Block", // From student profile
          qrToken: activePass.qrToken,
          validUntil: activePass.expiresAt || new Date(Date.now() + 24*60*60*1000).toISOString(),
          reason: activePass.reason,
          exitTime: activePass.exitTime,
        }}
        onBack={handleBackHome}
      />
    )
  }

  if (currentScreen === "new_request") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Button variant="outline" onClick={() => setCurrentScreen("home")} className="mb-6">
            ← Back to Home
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Request Night Permission
              </CardTitle>
              <CardDescription>Your request will go through the approval workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Workflow Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium mb-2">Approval Workflow:</p>
                <p className="text-xs text-blue-600">You → Society EB → President → Faculty Admin (Final) → QR Token</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reason for Permission</label>
                <Textarea placeholder="e.g., Library project work, Lab assignment..." id="reason" rows={3} />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input type="date" id="date" />
              </div>

              <Button
                onClick={() => {
                  const reason = (document.getElementById("reason") as HTMLTextAreaElement)?.value
                  const date = (document.getElementById("date") as HTMLInputElement)?.value
                  if (reason && date) handleNewRequest(reason, date)
                }}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "track") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => setCurrentScreen("home")} className="mb-6">
            ← Back to Home
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                My Permission Requests
              </CardTitle>
              <CardDescription>Track your requests through the approval workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {myRequests.map((req) => (
                <div key={req.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{req.reason}</h3>
                      <p className="text-sm text-muted-foreground">{req.date}</p>
                    </div>
                    <Badge className={getStatusColor(req.status)}>{getStatusLabel(req.status)}</Badge>
                  </div>
                  {/* Approval workflow - simplified display */}
                  <div className="text-xs text-muted-foreground">
                    Status: {getStatusLabel(req.status)}
                  </div>
                  {req.status === "APPROVED" && req.qrToken && (
                    <Button onClick={handleQRScan} className="w-full gap-2 bg-green-600 hover:bg-green-700">
                      <QrCode className="w-4 h-4" />
                      Show Green Pass
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentScreen === "history") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => setCurrentScreen("home")} className="mb-6">
            ← Back to Home
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Permission History</CardTitle>
              <CardDescription>Your past night permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "Dec 2, 2025", duration: "4h 32m", reason: "Library Project" },
                  { date: "Nov 28, 2025", duration: "3h 15m", reason: "Lab Work" },
                  { date: "Nov 25, 2025", duration: "5h 48m", reason: "Sports Event" },
                ].map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{entry.date}</p>
                        <p className="text-xs text-muted-foreground">{entry.reason}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{entry.duration}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Approval Notification Banner */}
        {myRequests.some((r) => r.status === "APPROVED" && r.qrToken) && (
          <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-pulse">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-green-800">✓ REQUEST APPROVED!</h3>
                  <p className="text-sm text-green-700 font-medium mt-1">
                    Your night permission has been approved by Faculty Admin
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    🎉 Your QR code is ready below - scan at hostel front desk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-primary/10 border-b-2 border-primary p-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Current Status</p>
              <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                <MapPin className="w-6 h-6" />
                In Hostel
              </h2>
              <p className="text-xs text-muted-foreground">Ready to scan at front desk</p>
            </div>
          </div>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Permissions This Month</p>
                <p className="text-2xl font-bold text-primary">3</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">
                  {myRequests.filter((r) => !r.status.includes("approved") && r.status !== "rejected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Pass - Show Green Pass */}
        {myRequests.some((r) => r.status === "APPROVED" && r.qrToken) && (
          <Button
            onClick={handleQRScan}
            size="lg"
            className="w-full h-24 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg font-bold gap-3 flex flex-col items-center justify-center rounded-xl shadow-lg"
          >
            <QrCode className="w-8 h-8" />
            Show Green Pass
          </Button>
        )}

        {/* New Request Button */}
        <Button
          onClick={() => setCurrentScreen("new_request")}
          size="lg"
          className="w-full h-20 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg font-bold gap-3 flex items-center justify-center rounded-xl shadow-lg"
        >
          <Send className="w-6 h-6" />
          Request Night Permission
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Additional Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setCurrentScreen("track")}>
            <FileText className="w-4 h-4" />
            Track Requests
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setCurrentScreen("history")}>
            <HistoryIcon className="w-4 h-4" />
            History
          </Button>
        </div>

        {/* Workflow Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700 font-medium mb-2">Approval Workflow:</p>
            <div className="flex flex-wrap gap-1 text-xs">
              <span className="bg-white px-2 py-1 rounded border">You</span>
              <span className="text-slate-400">→</span>
              <span className="bg-white px-2 py-1 rounded border">EB</span>
              <span className="text-slate-400">→</span>
              <span className="bg-white px-2 py-1 rounded border">President</span>
              <span className="text-slate-400">→</span>
              <span className="bg-white px-2 py-1 rounded border">Faculty Admin</span>
              <span className="text-slate-400">→</span>
              <span className="bg-green-100 px-2 py-1 rounded border border-green-300">QR Pass</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
