"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, CheckCircle, XCircle, AlertCircle, Shield, QrCode, Database, LogIn, LogOut, RefreshCw, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

type ScanMode = "exit" | "return"
type VerificationResult = null | "allowed" | "denied" | "expired" | "returned" | "already-returned"

interface GuardStats {
  todayExits: number
  todayReturns: number
  currentlyOut: number
}

export default function GuardInterface() {
  const [rollNo, setRollNo] = useState("")
  const [qrInput, setQrInput] = useState("")
  const [result, setResult] = useState<VerificationResult>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const [scanMode, setScanMode] = useState<ScanMode>("exit")
  const [stats, setStats] = useState<GuardStats>({ todayExits: 0, todayReturns: 0, currentlyOut: 0 })

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/guard/stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = qrInput.trim() || rollNo.trim()
    if (!token) return

    setVerifying(true)
    setResult(null)
    setStudentData(null)

    try {
      const endpoint = scanMode === "exit"
        ? `${API_URL}/api/guard/verify-qr`
        : `${API_URL}/api/guard/check-in`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token, guardId: 'guard-main' }),
      })

      const data = await response.json()

      if (data.success) {
        setStudentData(data.student)
        setResult(scanMode === "exit" ? "allowed" : "returned")
        fetchStats() // Refresh stats
      } else if (data.message?.includes('already returned')) {
        setStudentData(data.student)
        setResult("already-returned")
      } else if (data.message?.includes('expired')) {
        setResult("expired")
        setStudentData(data.student || null)
      } else {
        setResult("denied")
        setStudentData(data.student || null)
      }
    } catch (error) {
      console.error('Verification error:', error)
      setResult("denied")
    } finally {
      setVerifying(false)
    }
  }

  const resetForm = () => {
    setRollNo("")
    setQrInput("")
    setResult(null)
    setStudentData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Guard Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-sm text-muted-foreground mb-1">Hostel Gate Checkpoint</p>
                <h1 className="text-2xl font-bold text-foreground">Guard Verification Portal</h1>
                <p className="text-xs text-muted-foreground mt-2">Connected to CampusPass Core</p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Database className="w-5 h-5" />
                <span className="text-xs font-medium">LIVE</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4 text-center">
              <LogOut className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700">{stats.todayExits}</p>
              <p className="text-xs text-blue-600">Today's Exits</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 pb-4 text-center">
              <LogIn className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold text-green-700">{stats.todayReturns}</p>
              <p className="text-xs text-green-600">Returns</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4 pb-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <p className="text-2xl font-bold text-orange-700">{stats.currentlyOut}</p>
              <p className="text-xs text-orange-600">Out Now</p>
            </CardContent>
          </Card>
        </div>

        {/* Scan Mode Toggle */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Scan Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={scanMode} onValueChange={(v) => { setScanMode(v as ScanMode); resetForm(); }}>
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="exit" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <LogOut className="w-4 h-4" />
                  Exit Scan
                </TabsTrigger>
                <TabsTrigger value="return" className="gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  <LogIn className="w-4 h-4" />
                  Return Scan
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              {scanMode === "exit"
                ? "Verify student permission to leave campus"
                : "Record student return to campus"
              }
            </p>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card className={`shadow-lg border-2 ${scanMode === "exit" ? "border-blue-200" : "border-green-200"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {scanMode === "exit" ? "Exit Verification" : "Return Check-in"}
            </CardTitle>
            <CardDescription>
              {scanMode === "exit"
                ? "Scan QR or enter token to verify exit permission"
                : "Scan returning student's QR to log entry"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Input
                  placeholder="Paste QR Token here..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="text-sm font-mono"
                />
              </div>
              <Button
                type="submit"
                className={`w-full gap-2 text-base h-12 ${scanMode === "exit"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
                disabled={verifying}
              >
                {scanMode === "exit" ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {verifying
                  ? "Verifying..."
                  : scanMode === "exit"
                    ? "Verify Exit"
                    : "Record Return"
                }
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 text-base h-12 border-2"
                onClick={() => window.location.href = '/guard-scanner'}
              >
                <QrCode className="w-5 h-5" />
                Use Camera QR Scanner
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <>
            {/* Exit Allowed */}
            {result === "allowed" && studentData && (
              <Card className="border-green-200 bg-green-50 shadow-lg animate-in slide-in-from-bottom-4">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-green-900">EXIT APPROVED</h2>
                      <p className="text-sm text-green-700">Permission verified - Allow student to leave</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3 border border-green-200">
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">Name:</span>
                      <span className="font-semibold">{studentData.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">Roll No:</span>
                      <span className="font-semibold">{studentData.rollNo}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">Society:</span>
                      <span className="font-semibold">{studentData.society}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">Reason:</span>
                      <span className="font-semibold">{studentData.reason}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-600">Return By:</span>
                      <span className="font-bold text-green-700">{studentData.returnTime || studentData.validUntil}</span>
                    </div>
                  </div>

                  <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-green-900 flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      ALLOW STUDENT TO PROCEED
                    </p>
                  </div>

                  <Button onClick={resetForm} variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Return Success */}
            {result === "returned" && studentData && (
              <Card className="border-blue-200 bg-blue-50 shadow-lg animate-in slide-in-from-bottom-4">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <LogIn className="w-10 h-10 text-blue-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-blue-900">WELCOME BACK</h2>
                      <p className="text-sm text-blue-700">Student return logged successfully</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3 border border-blue-200">
                    <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                      <span className="font-medium text-slate-600">Name:</span>
                      <span className="font-semibold">{studentData.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                      <span className="font-medium text-slate-600">Roll No:</span>
                      <span className="font-semibold">{studentData.rollNo}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                      <span className="font-medium text-slate-600">Exit Time:</span>
                      <span className="font-semibold">{studentData.exitTime}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                      <span className="font-medium text-slate-600">Return Time:</span>
                      <span className="font-semibold">{studentData.returnTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-600">Time Out:</span>
                      <Badge className="bg-blue-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {studentData.timeOutMinutes} min
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-blue-900 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      ENTRY RECORDED
                    </p>
                  </div>

                  <Button onClick={resetForm} variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Already Returned */}
            {result === "already-returned" && studentData && (
              <Card className="border-yellow-200 bg-yellow-50 shadow-lg animate-in slide-in-from-bottom-4">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-10 h-10 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-yellow-900">ALREADY RETURNED</h2>
                      <p className="text-sm text-yellow-700">This student has already checked in</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <p><strong>Name:</strong> {studentData.name}</p>
                    <p><strong>Returned at:</strong> {studentData.checkInAt}</p>
                  </div>
                  <Button onClick={resetForm} variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Expired */}
            {result === "expired" && (
              <Card className="border-yellow-200 bg-yellow-50 shadow-lg animate-in slide-in-from-bottom-4">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-10 h-10 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-yellow-900">PERMISSION EXPIRED</h2>
                      <p className="text-sm text-yellow-700">QR Token validity has ended</p>
                    </div>
                  </div>
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-yellow-900">ASK STUDENT TO GET NEW PERMISSION</p>
                  </div>
                  <Button onClick={resetForm} variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Denied */}
            {result === "denied" && (
              <Card className="border-red-200 bg-red-50 shadow-lg animate-in slide-in-from-bottom-4">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-red-900">ACCESS DENIED</h2>
                      <p className="text-sm text-red-700">No valid permission found</p>
                    </div>
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-red-900">
                      {scanMode === "exit"
                        ? "STUDENT CANNOT LEAVE CAMPUS"
                        : "CANNOT LOG RETURN - NO EXIT RECORD"
                      }
                    </p>
                  </div>
                  <Button onClick={resetForm} variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Scan Next
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Instructions */}
        <Card className="bg-slate-100">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Checkpoint Instructions:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Select <strong>Exit Scan</strong> for students leaving or <strong>Return Scan</strong> for returning</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Scan student's QR code or paste their token</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Green = Approved | Blue = Returned | Yellow = Expired | Red = Denied</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

