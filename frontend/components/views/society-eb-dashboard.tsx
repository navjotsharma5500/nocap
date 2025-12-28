"use client"

import { useState, useEffect } from "react"
import { Plus, Users, FileText, Send, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import WorkflowTracker from "@/components/workflow-tracker"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
// Fallback ID for demo mode
const DEFAULT_SOCIETY_ID = "7369c6c1-3881-4ef3-a17a-390b63d4895e"

interface SocietyEBDashboardProps {
  societyId?: string
  societyName?: string
}

export default function SocietyEBDashboard({ societyId, societyName }: SocietyEBDashboardProps) {
  const SOCIETY_ID = societyId || DEFAULT_SOCIETY_ID
  const displayName = societyName || "Your Society"

  const [screen, setScreen] = useState<"list" | "create" | "review" | "members">("list")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [pendingMembers, setPendingMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch pending membership requests
  useEffect(() => {
    fetchPendingMembers()
    fetchPendingRequests()
  }, [])

  const fetchPendingMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eb/pending-members/${SOCIETY_ID}`)
      const data = await response.json()
      setPendingMembers(data)
    } catch (error) {
      console.error('Failed to fetch pending members:', error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/approvals/eb/${SOCIETY_ID}`)
      const data = await response.json()
      setIncomingRequests(data)
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  // Note: Permission requests in backend start at PENDING_PRESIDENT, not EB review
  // EB dashboard focuses on member approvals and bulk requests
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])

  const [bulkRequests, setBulkRequests] = useState<any[]>([])

  const allStudents = pendingMembers.map((m: any) => ({
    id: m.id,
    name: m.user?.name || "Unknown",
    rollNo: m.user?.rollNo || "N/A",
  }))

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleApproveMember = async (membershipId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch(`${API_URL}/api/eb/approve-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId, status }),
      })

      if (response.ok) {
        await fetchPendingMembers() // Refresh list
      } else {
        alert('Failed to process membership')
      }
    } catch (error) {
      console.error('Failed to approve member:', error)
      alert('Failed to process membership')
    }
  }

  // Note: Individual permission requests skip EB and go directly to President in backend
  const handleApproveIndividual = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/approvals/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          status: 'PENDING_PRESIDENT',
          type: 'permission',
        }),
      })

      if (response.ok) {
        await fetchPendingRequests() // Refresh list
      } else {
        alert('Failed to approve request')
      }
    } catch (error) {
      console.error('Failed to approve:', error)
      alert('Failed to approve request')
    }
  }

  const handleRejectIndividual = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/approvals/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          status: 'REJECTED',
          type: 'permission',
        }),
      })

      if (response.ok) {
        await fetchPendingRequests() // Refresh list
      } else {
        alert('Failed to reject request')
      }
    } catch (error) {
      console.error('Failed to reject:', error)
      alert('Failed to reject request')
    }
  }

  const handleSubmitBulkRequest = (reason: string, date: string) => {
    const newRequest = {
      id: `bulk-${Date.now()}`,
      name: reason,
      date,
      studentCount: selectedStudents.length,
      status: "pending_president_review",
      timestamp: "just now",
    }
    setBulkRequests([newRequest, ...bulkRequests])
    setSelectedStudents([])
    setScreen("list")
  }

  const pendingReviews = incomingRequests.filter((r) => r.status === "PENDING_EB")

  if (screen === "members") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" onClick={() => setScreen("list")} className="mb-6">
            ← Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pending Membership Approvals
              </CardTitle>
              <CardDescription>Review students requesting to join your society</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending membership requests</p>
              ) : (
                pendingMembers.map((member) => (
                  <div key={member.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{member.user?.name || "Unknown"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.rollNo || "N/A"} | {member.user?.branch || "N/A"}
                        </p>
                        {member.proofUrl && (
                          <a href={member.proofUrl} target="_blank" rel="noopener" className="text-xs text-blue-600 underline">
                            View Proof
                          </a>
                        )}
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveMember(member.id, "APPROVED")}
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Member
                      </Button>
                      <Button
                        onClick={() => handleApproveMember(member.id, "REJECTED")}
                        variant="destructive"
                        className="flex-1 gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (screen === "review") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" onClick={() => setScreen("list")} className="mb-6">
            ← Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Level 1 Review - Individual Requests
              </CardTitle>
              <CardDescription>Review and forward student requests to Society President</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingReviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending requests to review</p>
              ) : (
                pendingReviews.map((req) => (
                  <div key={req.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{req.student?.name || "Unknown Student"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {req.student?.rollNo || "N/A"} | {req.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Date: {new Date(req.date).toLocaleDateString()} | Exit: {req.exitTime}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Awaiting Your Review</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveIndividual(req.id)}
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Forward to President
                      </Button>
                      <Button
                        onClick={() => handleRejectIndividual(req.id)}
                        variant="destructive"
                        className="flex-1 gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (screen === "create") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => setScreen("list")} className="mb-6">
            ← Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Initiate Bulk Permission Request</CardTitle>
              <CardDescription>Select multiple students for society activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workflow Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium mb-2">Bulk Request Workflow:</p>
                <p className="text-xs text-blue-600">EB Submits → President Review → Faculty Admin (Final) → QR Tokens</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Activity / Reason</label>
                <Input placeholder="e.g., Hackathon Prep, Sports Event..." id="reason" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input type="date" id="date" />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Select Students ({selectedStudents.length} selected)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-slate-200 p-3 rounded-lg">
                  {allStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">{student.rollNo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => {
                  const reason = (document.getElementById("reason") as HTMLInputElement)?.value
                  const date = (document.getElementById("date") as HTMLInputElement)?.value
                  if (reason && date && selectedStudents.length > 0) handleSubmitBulkRequest(reason, date)
                }}
                className="w-full gap-2"
                disabled={selectedStudents.length === 0}
              >
                <Send className="w-4 h-4" />
                Submit to President
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Society EB Dashboard</h1>
            <p className="text-muted-foreground">Level 1 Review - Manage member permissions and bulk requests</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setScreen("members")} variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Approve Members ({pendingMembers.length})
            </Button>
            <Button onClick={() => setScreen("review")} variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Review Requests ({pendingReviews.length})
            </Button>
            <Button onClick={() => setScreen("create")} className="gap-2">
              <Plus className="w-4 h-4" />
              Bulk Request
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Pending Your Review</p>
              <p className="text-3xl font-bold text-yellow-700">{pendingReviews.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Forwarded to President</p>
              <p className="text-3xl font-bold text-blue-700">
                {incomingRequests.filter((r) => r.status !== "pending_eb_review" && r.status !== "rejected").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Bulk Requests Sent</p>
              <p className="text-3xl font-bold text-green-700">{bulkRequests.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-slate-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Your Role in the Workflow</h3>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="px-3 py-1 bg-slate-200 rounded">Student</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold">
                Society EB (You)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-slate-200 rounded">President</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-slate-200 rounded">Faculty Admin (Final)</span>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Bulk Requests Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bulkRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{req.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {req.studentCount} students | {req.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(req.status as any)}>{getStatusLabel(req.status as any)}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{req.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
