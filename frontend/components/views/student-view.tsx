"use client"

import { useState, useEffect } from "react"
import { QrCode, Users, Send, CheckCircle, Clock, Camera, ArrowRight, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Scanner } from "@yudiel/react-qr-scanner"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface StudentViewProps {
  studentId?: string
}

interface Membership {
  id: string
  societyId: string
  status: string
  society: {
    id: string
    name: string
    joinCode: string
  }
}

interface MembershipData {
  hasMembership: boolean
  hasApprovedMembership: boolean
  memberships: Membership[]
  activeSociety: { id: string; name: string } | null
}

export default function StudentView({ studentId }: StudentViewProps) {
  const [screen, setScreen] = useState<"loading" | "join" | "pending" | "dashboard" | "scanner" | "request" | "pass" | "join-more">("loading")
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null)
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [activePass, setActivePass] = useState<any>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)

  // Fetch membership status on mount
  useEffect(() => {
    if (studentId) {
      fetchMembershipStatus()
    }
  }, [studentId])

  const fetchMembershipStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/student/${studentId}/memberships`)
      const data = await res.json()
      setMembershipData(data)

      if (data.hasApprovedMembership) {
        setScreen("dashboard")
        fetchRequests(data.activeSociety?.id)
      } else if (data.hasMembership) {
        setScreen("pending")
      } else {
        setScreen("join")
      }
    } catch (error) {
      console.error("Failed to fetch membership:", error)
      setScreen("join")
    }
  }

  const fetchRequests = async (societyId?: string) => {
    if (!studentId) return
    try {
      const res = await fetch(`${API_URL}/api/permissions/student/${studentId}`)
      const data = await res.json()
      setRequests(data)

      // Check for approved pass
      const approved = data.find((r: any) => r.status === 'APPROVED' && r.qrToken)
      if (approved) {
        setActivePass(approved)
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    }
  }

  const handleJoinSociety = async () => {
    if (!joinCode.trim() || !studentId) return
    setJoinLoading(true)
    setJoinError("")

    try {
      const res = await fetch(`${API_URL}/api/societies/join-by-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: studentId, joinCode: joinCode.toUpperCase() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setJoinError(data.error || "Failed to join society")
      } else {
        // Reset join code
        setJoinCode("")

        // If coming from join-more (already has approved membership), stay on dashboard
        if (membershipData?.hasApprovedMembership) {
          // Refresh membership data to show new pending society
          const refreshRes = await fetch(`${API_URL}/api/student/${studentId}/memberships`)
          const refreshData = await refreshRes.json()
          setMembershipData(refreshData)
          setScreen("dashboard")
        } else {
          // First time join - go through normal flow
          await fetchMembershipStatus()
        }
      }
    } catch (error) {
      setJoinError("Network error. Please try again.")
    } finally {
      setJoinLoading(false)
    }
  }

  const handleNewRequest = async (reason: string, date: string) => {
    if (!studentId || !membershipData?.activeSociety) return

    try {
      const res = await fetch(`${API_URL}/api/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          societyId: membershipData.activeSociety.id,
          reason,
          date,
          exitTime: "20:00",
          returnTime: "23:00",
        }),
      })

      if (res.ok) {
        await fetchRequests(membershipData.activeSociety.id)
        setScreen("dashboard")
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error || "Unknown error"}`)
      }
    } catch (error) {
      alert("Failed to submit request")
    }
  }

  const handleScan = (result: any) => {
    if (result?.[0]?.rawValue) {
      setScannedData(result[0].rawValue)
    }
  }

  // LOADING SCREEN
  if (screen === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-foreground"></div>
      </div>
    )
  }

  // JOIN SOCIETY SCREEN
  if (screen === "join") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto pt-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-2xl font-bold">Join a Society</h1>
            <p className="text-muted-foreground mt-2">
              Enter the join code provided by your society EB
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Society Join Code</label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g., CSS2024"
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {joinError && (
                <p className="text-sm text-destructive text-center">{joinError}</p>
              )}

              <Button
                onClick={handleJoinSociety}
                disabled={!joinCode.trim() || joinLoading}
                className="w-full"
              >
                {joinLoading ? "Joining..." : "Join Society"}
              </Button>

              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>Available codes for testing:</p>
                <p className="font-mono mt-1">CSS2024, URJA2024, MLSC2024</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // PENDING APPROVAL SCREEN  
  if (screen === "pending") {
    const pendingMembership = membershipData?.memberships.find(m => m.status === "PENDING")

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto pt-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Waiting for Approval</h1>
            <p className="text-muted-foreground mt-2">
              Your request to join <strong>{pendingMembership?.society.name}</strong> is pending EB approval
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Badge variant="secondary" className="text-sm">
                Pending EB Review
              </Badge>

              <p className="text-sm text-muted-foreground">
                The society EB will review your request and approve your membership.
                Once approved, you'll be able to request night permissions.
              </p>

              <Button
                onClick={fetchMembershipStatus}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // QR SCANNER SCREEN
  if (screen === "scanner") {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => { setScreen("dashboard"); setScannedData(null); }}
            variant="ghost"
            className="text-white mb-4"
          >
            ← Back
          </Button>

          <div className="text-center text-white mb-4">
            <h2 className="text-xl font-bold">Scan Hostel QR</h2>
            <p className="text-sm text-gray-400">Point camera at the QR code at hostel front desk</p>
          </div>

          <div className="rounded-xl overflow-hidden">
            <Scanner onScan={handleScan} />
          </div>

          {scannedData && (
            <Card className="mt-4">
              <CardContent className="pt-4">
                <p className="text-sm font-medium">Scanned Data:</p>
                <p className="text-xs text-muted-foreground break-all mt-1">{scannedData}</p>
                <Button
                  onClick={() => { setScreen("request"); setScannedData(null); }}
                  className="w-full mt-4"
                >
                  Request Night Permission
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // REQUEST FORM SCREEN
  if (screen === "request") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Button onClick={() => setScreen("dashboard")} variant="outline" className="mb-6">
            ← Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Request Night Permission
              </CardTitle>
              <CardDescription>
                Society: {membershipData?.activeSociety?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg text-xs">
                <p className="font-medium mb-1">Approval Flow:</p>
                <p>You → EB → President → Faculty Admin → QR Pass</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reason</label>
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
                className="w-full"
              >
                Submit Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // PASS SCREEN (with QR)
  if (screen === "pass" && activePass) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="max-w-sm w-full">
          <Card className="border-2 border-white">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="bg-white p-4 rounded-xl inline-block">
                <QrCode className="w-32 h-32 text-black" />
              </div>

              <div className="text-left space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Name</span>
                  <span className="font-medium">{activePass.student?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Roll No</span>
                  <span className="font-medium">{activePass.student?.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Society</span>
                  <span className="font-medium">{activePass.society?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Reason</span>
                  <span className="font-medium">{activePass.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Exit Time</span>
                  <span className="font-medium">{activePass.exitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Valid Until</span>
                  <span className="font-medium">{activePass.expiresAt ? new Date(activePass.expiresAt).toLocaleString() : "N/A"}</span>
                </div>
              </div>

              <Badge className="bg-white text-black">
                ✓ APPROVED
              </Badge>

              <Button onClick={() => setScreen("dashboard")} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // JOIN MORE SOCIETIES SCREEN
  if (screen === "join-more") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto pt-4">
          <Button onClick={() => setScreen("dashboard")} variant="outline" className="mb-6">
            ← Back to Dashboard
          </Button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-7 h-7 text-background" />
            </div>
            <h1 className="text-xl font-bold">Join Another Society</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter the join code to request membership
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Society Join Code</label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g., URJA2024"
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {joinError && (
                <p className="text-sm text-destructive text-center">{joinError}</p>
              )}

              <Button
                onClick={handleJoinSociety}
                disabled={!joinCode.trim() || joinLoading}
                className="w-full"
              >
                {joinLoading ? "Joining..." : "Request Membership"}
              </Button>

              {/* Show current memberships */}
              {membershipData && membershipData.memberships.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Your Societies:</p>
                  <div className="flex flex-wrap gap-2">
                    {membershipData.memberships.map((m) => (
                      <Badge
                        key={m.id}
                        variant={m.status === "APPROVED" ? "default" : "secondary"}
                      >
                        {m.society.name}
                        {m.status === "PENDING" && " (Pending)"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                <p>Available codes:</p>
                <p className="font-mono mt-1">CSS2024, URJA2024, MLSC2024, ECHOES2024, OASIS2024</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Society Badge */}
        <div className="text-center">
          <Badge variant="secondary" className="text-sm">
            {membershipData?.activeSociety?.name} Member
          </Badge>
        </div>

        {/* Approved Pass Banner */}
        {activePass && (
          <Card className="border-2 border-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-foreground rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-background" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">Pass Approved!</h3>
                  <p className="text-sm text-muted-foreground">Tap to view your QR code</p>
                </div>
              </div>
              <Button onClick={() => setScreen("pass")} className="w-full mt-4 gap-2">
                <QrCode className="w-4 h-4" />
                Show Pass
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid gap-3">
          <Button
            onClick={() => setScreen("scanner")}
            variant="outline"
            className="h-16 gap-3 justify-start"
          >
            <Camera className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Scan Hostel QR</div>
              <div className="text-xs text-muted-foreground">Required before requesting permission</div>
            </div>
          </Button>

          <Button
            onClick={() => setScreen("request")}
            className="h-16 gap-3 justify-start"
          >
            <Send className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Request Night Permission</div>
              <div className="text-xs opacity-80">Submit a new request</div>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <Button
            onClick={() => setScreen("join-more")}
            variant="outline"
            className="h-14 gap-3 justify-start"
          >
            <Plus className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Join More Societies</div>
              <div className="text-xs text-muted-foreground">Expand your campus network</div>
            </div>
          </Button>
        </div>

        {/* Pending Requests */}
        {requests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{req.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(req.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(req.status)}>
                    {getStatusLabel(req.status)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
