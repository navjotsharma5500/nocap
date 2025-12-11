"use client"

import type React from "react"
import { useState } from "react"
import { Search, CheckCircle, XCircle, AlertCircle, Shield, QrCode, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import WorkflowTracker from "@/components/workflow-tracker"

type VerificationResult = null | "allowed" | "denied" | "expired"

export default function GuardInterface() {
  const [rollNo, setRollNo] = useState("")
  const [result, setResult] = useState<VerificationResult>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)

  // Campus pass database for verification
  const campusPassCore: Record<string, any> = {
    CS21B034: {
      name: "Raj Kumar Singh",
      hostel: "B-Block",
      validUntil: "2:00 AM",
      status: "allowed",
      qrToken: "QR-2025-CS21B034-001",
      approvalHistory: [
        { level: "student", action: "approved" },
        { level: "society_eb", action: "approved" },
        { level: "society_president", action: "approved" },
        { level: "faculty_admin", action: "approved" },
      ],
    },
    CS21B045: {
      name: "Priya Singh",
      hostel: "A-Block",
      validUntil: "1:30 AM",
      status: "allowed",
      qrToken: "QR-2025-CS21B045-002",
      approvalHistory: [
        { level: "student", action: "approved" },
        { level: "society_eb", action: "approved" },
        { level: "society_president", action: "approved" },
        { level: "faculty_admin", action: "approved" },
      ],
    },
    EC21B023: {
      name: "Amit Patel",
      hostel: "C-Block",
      validUntil: "11:59 PM",
      status: "expired",
      qrToken: "QR-2025-EC21B023-003",
      approvalHistory: [
        { level: "student", action: "approved" },
        { level: "society_eb", action: "approved" },
        { level: "society_president", action: "approved" },
        { level: "faculty_admin", action: "approved" },
      ],
    },
    ME21B056: {
      name: "Neha Sharma",
      hostel: "D-Block",
      status: "denied",
      reason: "Pending Faculty Admin approval",
      approvalHistory: [
        { level: "student", action: "approved" },
        { level: "society_eb", action: "approved" },
        { level: "society_president", action: "approved" },
        { level: "faculty_admin", action: "pending" },
      ],
    },
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rollNo.trim()) return

    setVerifying(true)
    // Simulate CampusPass Core lookup
    await new Promise((resolve) => setTimeout(resolve, 500))

    const student = campusPassCore[rollNo.toUpperCase()]
    if (student) {
      setStudentData(student)
      setResult(student.status as VerificationResult)
    } else {
      setStudentData(null)
      setResult("denied")
    }
    setVerifying(false)
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

        {/* Data Flow Info */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="px-2 py-1 bg-white rounded border">Student QR</span>
              <span className="text-slate-400">→</span>
              <span className="px-2 py-1 bg-primary/10 rounded border border-primary/30 font-medium">Guard Scan</span>
              <span className="text-slate-400">→</span>
              <span className="px-2 py-1 bg-white rounded border">CampusPass Core</span>
              <span className="text-slate-400">→</span>
              <span className="px-2 py-1 bg-green-100 rounded border border-green-300">Verify & Grant</span>
            </div>
          </CardContent>
        </Card>

        {/* Verification Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan QR or Enter Roll Number
            </CardTitle>
            <CardDescription>Verify student permission against CampusPass Core</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Input
                  placeholder="e.g., CS21B034"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="text-lg font-semibold tracking-widest uppercase"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Test: CS21B034 (Allowed), CS21B045 (Allowed), EC21B023 (Expired), ME21B056 (Pending)
                </p>
              </div>
              <Button type="submit" className="w-full gap-2 text-base h-12" disabled={verifying}>
                <Search className="w-4 h-4" />
                {verifying ? "Verifying with CampusPass Core..." : "Verify Student"}
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
                className="w-full gap-2 text-base h-12 border-2 border-primary hover:bg-primary hover:text-primary-foreground"
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
            {result === "allowed" && studentData && (
              <Card className="border-green-200 bg-green-50 shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-green-900">PERMISSION GRANTED</h2>
                      <p className="text-sm text-green-700">All approvals complete - QR Token Active</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3 border border-green-200">
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">Name:</span>
                      <span className="font-semibold">{studentData.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">Roll No:</span>
                      <span className="font-semibold">{rollNo.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">Hostel:</span>
                      <span className="font-semibold">{studentData.hostel}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-green-100">
                      <span className="font-medium text-slate-600">QR Token:</span>
                      <span className="font-mono text-xs bg-green-100 px-2 py-1 rounded">{studentData.qrToken}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-600">Valid Until:</span>
                      <span className="font-bold text-green-700">{studentData.validUntil}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-green-700 font-medium mb-2">Approval Chain Verified:</p>
                    <WorkflowTracker steps={studentData.approvalHistory} />
                  </div>

                  <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-green-900 flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      ALLOW STUDENT TO PROCEED
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result === "expired" && studentData && (
              <Card className="border-yellow-200 bg-yellow-50 shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-10 h-10 text-yellow-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-yellow-900">PERMISSION EXPIRED</h2>
                      <p className="text-sm text-yellow-700">QR Token validity has ended</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 space-y-2 border border-yellow-200">
                    <p>
                      <strong>Name:</strong> {studentData.name}
                    </p>
                    <p>
                      <strong>Expired At:</strong> {studentData.validUntil}
                    </p>
                  </div>
                  <WorkflowTracker steps={studentData.approvalHistory} />
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-yellow-900">ASK STUDENT TO RETURN TO HOSTEL</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result === "denied" && (
              <Card className="border-red-200 bg-red-50 shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-red-900">ACCESS DENIED</h2>
                      <p className="text-sm text-red-700">
                        {studentData ? studentData.reason : "No valid permission found in CampusPass Core"}
                      </p>
                    </div>
                  </div>
                  {studentData && (
                    <>
                      <div className="bg-white rounded-lg p-4 border border-red-200">
                        <p>
                          <strong>Name:</strong> {studentData.name}
                        </p>
                        <p>
                          <strong>Status:</strong> Approval pending
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-red-700 font-medium mb-2">Approval Status:</p>
                        <WorkflowTracker steps={studentData.approvalHistory} />
                      </div>
                    </>
                  )}
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-red-900">STUDENT CANNOT LEAVE HOSTEL</p>
                  </div>
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
                <span>Scan student's QR code or enter Roll Number</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>System verifies against CampusPass Core database</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Check full approval chain is complete (all green checkmarks)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>Green = Allow | Yellow = Expired | Red = Deny</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
