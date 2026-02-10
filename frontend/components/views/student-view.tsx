"use client"

import { useState, useEffect, useRef } from "react"
import { QrCode, Users, CheckCircle, Clock, Camera, RefreshCw, Plus, Info, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import QrScanner from "qr-scanner"
import QRCode from 'qrcode'
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const HOSTEL_QR_CODE = "HOSTEL_DESK_ACTIVATE_V1"

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
  const [screen, setScreen] = useState<"loading" | "join" | "pending" | "dashboard" | "scanner" | "pass" | "join-more">("loading")
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null)
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")
  const [joinLoading, setJoinLoading] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [activePass, setActivePass] = useState<any>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [activationLoading, setActivationLoading] = useState(false)
  const [isSecure, setIsSecure] = useState(true)

  // QR Scanner refs and state
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const [scannerError, setScannerError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSecure(window.isSecureContext)
    }
  }, [])

  // Fetch membership status on mount
  useEffect(() => {
    if (studentId) {
      fetchMembershipStatus()
    }
  }, [studentId])

  // Initialize QR Scanner when on scanner screen
  useEffect(() => {
    if (screen === "scanner" && videoRef.current) {
      initializeScanner()
    }
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy()
        qrScannerRef.current = null
      }
    }
  }, [screen])

  const initializeScanner = async () => {
    if (!videoRef.current) return

    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        }
      )
      await qrScannerRef.current.start()
    } catch (error) {
      console.error("Failed to start QR scanner:", error)
      setScannerError("Failed to access camera. Please check permissions.")
    }
  }

  // Generate QR code when active pass changes
  useEffect(() => {
    if (activePass?.qrToken) {
      generateQrCode(activePass.qrToken)
    }
  }, [activePass])

  const generateQrCode = async (token: string) => {
    try {
      const url = await QRCode.toDataURL(token, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
      setQrDataUrl(url)
    } catch (error) {
      console.error('QR generation error:', error)
    }
  }

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

      // Check for approved pass (Active: Approved + QR + Not Returned)
      const approved = data.find((r: any) => r.status === 'APPROVED' && r.qrToken && !r.checkInAt)
      if (approved) {
        setActivePass(approved)
      } else {
        setActivePass(null)
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

  const isWithinTimeWindow = (dateStr: string, exitTimeStr: string, returnTimeStr?: string) => {
    const now = new Date()
    const permDate = new Date(dateStr)

    const parseTime = (timeStr: string, baseDate: Date) => {
      const d = new Date(baseDate)
      const [time, modifier] = timeStr.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (modifier === 'PM' && hours < 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      d.setHours(hours, minutes, 0, 0)
      return d
    }

    const startTime = parseTime(exitTimeStr, permDate)
    let endTime = returnTimeStr ? parseTime(returnTimeStr, permDate) : null

    if (!endTime) {
      // Default to 2 AM next day
      endTime = new Date(permDate)
      endTime.setDate(endTime.getDate() + 1)
      endTime.setHours(2, 0, 0, 0)
    } else if (endTime < startTime) {
      // Return time is likely early morning next day
      endTime.setDate(endTime.getDate() + 1)
    }

    return now >= startTime && now <= endTime
  }

  const handleScan = async (scannedValue: string) => {
    if (scannedValue) {
      // Stop scanner while processing
      if (qrScannerRef.current) {
        qrScannerRef.current.stop()
      }

      setScannedData(scannedValue)

      // Logic for Hostel Desk Activation
      if (scannedValue === HOSTEL_QR_CODE) {
        // Priority 1: Find a LIVE permission (verified but not checked-in) -> To Return
        let permissionToProcess = requests.find(r =>
          r.status === 'APPROVED' &&
          r.verifiedAt &&
          !r.checkInAt
        )

        // Priority 2: Find a FRESH permission (not verified) -> To Exit
        if (!permissionToProcess) {
          permissionToProcess = requests.find(r => {
            const isApproved = r.status === 'APPROVED' &&
              !r.verifiedAt &&
              r.activationStatus !== 'PENDING_EB_ACTIVATION'

            if (!isApproved) return false

            // Time window validation
            return isWithinTimeWindow(r.date, r.exitTime, r.returnTime)
          })
        }

        if (permissionToProcess) {
          setActivationLoading(true)
          try {
            const res = await fetch(`${API_URL}/api/student/activate-permission`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ permissionId: permissionToProcess.id, studentId })
            })

            const responseData = await res.json()

            if (res.ok) {
              alert(`✅ Success!\n\n${responseData.message}`)
              setScreen("dashboard")
              fetchRequests() // Refresh list
            } else {
              alert(`Action Failed: ${responseData.error || 'Unknown error'}`)
              // Restart scanner if failed
              if (qrScannerRef.current) qrScannerRef.current.start()
            }
          } catch (error) {
            console.error("Activation error:", error)
            alert("Network error during activation")
            // Restart scanner if failed
            if (qrScannerRef.current) qrScannerRef.current.start()
          } finally {
            setActivationLoading(false)
          }
        } else {
          // Check if there was an approved permission that was simply OUTSIDE the time window
          const approvedButNotTime = requests.find(r =>
            r.status === 'APPROVED' && !r.verifiedAt && r.activationStatus !== 'PENDING_EB_ACTIVATION'
          )

          if (approvedButNotTime) {
            alert(`Too early or too late!\n\nYour permission window is from ${approvedButNotTime.exitTime} to ${approvedButNotTime.returnTime || '2:00 AM'}.\n\nPlease scan during this time.`)
          } else {
            alert("No approved permissions found eligible for Exit or Return.")
          }
          // Restart scanner
          if (qrScannerRef.current) qrScannerRef.current.start()
        }
      } else {
        alert(`Unrecognized QR Code: "${scannedValue}"\n\nPlease scan the specific QR code at the Hostel Front Desk.`)
        // Restart scanner
        if (qrScannerRef.current) qrScannerRef.current.start()
      }
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
                Once approved, you'll be able to view your night permission passes.
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
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
        {/* Header / Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={() => { setScreen("dashboard"); setScannedData(null); }}
            variant="ghost"
            className="text-white hover:bg-white/10 rounded-full h-10 w-10 p-0 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="w-full max-w-md space-y-6 relative">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Scan QR Code</h2>
            <p className="text-slate-400 text-sm">Align the hostel QR code within the frame</p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-square border-2 border-slate-800">
            {/* Camera View */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Darkened borders */}
              <div className="absolute inset-0 border-[40px] border-black/50 z-10"></div>

              {/* Scan Frame */}
              <div className="absolute top-0 left-0 w-full h-full z-20 flex items-center justify-center">
                <div className="w-64 h-64 relative">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>

                  {/* Animated Laser Line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-[scan_2s_ease-in-out_infinite] opacity-80"></div>
                </div>
              </div>
            </div>

            {/* Error State */}
            {!isSecure && (
              <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4 border border-red-500/50">
                  <Camera className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-red-100 mb-2">Camera Access Blocked</h3>
                <p className="text-red-400 text-sm">
                  This feature requires a secure HTTPS connection.
                </p>
              </div>
            )}

            {scannerError && (
              <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4 border border-red-500/50">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-red-300 text-sm mb-4">{scannerError}</p>
                <Button
                  onClick={() => {
                    setScannerError(null);
                    initializeScanner();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-950 hover:text-red-300"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Processing State */}
            {activationLoading && (
              <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in">
                <div className="relative mb-4">
                  <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verifying...</h3>
                <p className="text-slate-400 text-sm font-medium">Checking your permission</p>
              </div>
            )}

            {/* Scanned Result State (Before processing finishes or if idle) */}
            {scannedData && !activationLoading && (
              <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                <p className="text-white text-lg font-semibold mb-2">Code Scanned!</p>
                <p className="text-slate-400 text-xs font-mono bg-black/50 px-3 py-1 rounded-full border border-white/10 mb-6 max-w-[200px] truncate">
                  {scannedData}
                </p>
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={() => {
                      setScannedData(null)
                      if (qrScannerRef.current) qrScannerRef.current.start()
                    }}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    Scan Again
                  </Button>
                  <Button
                    onClick={() => {
                      setScreen("dashboard")
                      setScannedData(null)
                    }}
                    className="flex-1 bg-white text-black hover:bg-slate-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-white/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Pro Tip:</strong> Ensure you are in a well-lit area. Point your camera at the specific QR code located at the Hostel Front Desk.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Animation Styles */}
        <style jsx global>{`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    )
  }

  // PASS SCREEN (with QR)
  if (screen === "pass" && activePass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
        <div className="max-w-sm w-full">
          <Card className="border-2 border-green-500 shadow-2xl">
            <CardContent className="pt-6 text-center space-y-4">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-black animate-pulse" />
                  </div>
                )}
              </div>

              {/* Student Details */}
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
                  <span className="font-medium text-right max-w-[180px] truncate">{activePass.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Exit Time</span>
                  <span className="font-medium">{activePass.exitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Return Time</span>
                  <span className="font-medium">{activePass.returnTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Valid Until</span>
                  <span className="font-medium">{activePass.expiresAt ? new Date(activePass.expiresAt).toLocaleString() : "N/A"}</span>
                </div>
              </div>

              <Badge className="bg-green-600 text-white text-lg px-4 py-1">
                APPROVED
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
          <Card className="border-2 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">Pass Approved!</h3>
                  <p className="text-sm text-muted-foreground">Tap to view your QR code</p>
                </div>
              </div>
              <Button onClick={() => setScreen("pass")} className="w-full mt-4 gap-2 bg-green-600 hover:bg-green-700">
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
              <div className="text-xs text-muted-foreground">For hostel check-in/out</div>
            </div>
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
              <CardTitle className="text-lg">My Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.slice(0, 5).map((req) => {
                // Check if this is an approved pass that can be activated
                const canActivate = req.status === 'APPROVED' && !req.verifiedAt && !req.activationStatus
                const isPendingActivation = req.activationStatus === 'PENDING_EB_ACTIVATION'
                const isActivated = req.activationStatus === 'ACTIVATED'

                return (
                  <div key={req.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{req.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(req.status)}>
                          {getStatusLabel(req.status)}
                        </Badge>
                        {isPendingActivation && (
                          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                            Activating...
                          </Badge>
                        )}
                        {isActivated && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            Activated
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Activate button for approved permissions not yet scanned */}
                    {canActivate && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full text-sm gap-1"
                        onClick={async () => {
                          // Frontend check for feedback
                          if (!isWithinTimeWindow(req.date, req.exitTime, req.returnTime)) {
                            alert(`Too early or too late!\n\nYour permission window is from ${req.exitTime} to ${req.returnTime || '2:00 AM'}.`);
                            return;
                          }

                          try {
                            const res = await fetch(`${API_URL}/api/student/activate-permission`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ permissionId: req.id, studentId })
                            })

                            const data = await res.json();

                            if (res.ok) {
                              alert('✅ Permission Activated! You may leave now.');
                              fetchRequests()
                            } else {
                              alert(`Failed to activate: ${data.error || 'Unknown error'}`);
                            }
                          } catch (error) {
                            console.error('Activation error:', error);
                            alert('Network error. Failed to activate permission.');
                          }
                        }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Activate Permission (Skip Hostel Scan)
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
