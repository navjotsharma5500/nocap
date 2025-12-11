"use client"

import { useState } from "react"
import { Plus, Users, FileText, Send, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import WorkflowTracker from "@/components/workflow-tracker"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

export default function SocietyEBDashboard() {
  const [screen, setScreen] = useState<"list" | "create" | "review">("list")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Incoming individual requests that need EB review
  const [incomingRequests, setIncomingRequests] = useState([
    {
      id: "inc-1",
      studentName: "Aakash Mehta",
      rollNo: "CS21B050",
      reason: "Lab project deadline",
      date: "2025-12-11",
      submittedAt: "30 min ago",
      status: "pending_eb_review",
      approvalHistory: [
        { level: "student" as const, action: "approved" as const, timestamp: "Dec 11, 2:00 PM" },
        { level: "society_eb" as const, action: "pending" as const },
        { level: "society_president" as const, action: "pending" as const },
        { level: "faculty_admin" as const, action: "pending" as const },
      ],
    },
    {
      id: "inc-2",
      studentName: "Sneha Patel",
      rollNo: "CS21B051",
      reason: "Competition preparation",
      date: "2025-12-11",
      submittedAt: "1 hour ago",
      status: "pending_eb_review",
      approvalHistory: [
        { level: "student" as const, action: "approved" as const, timestamp: "Dec 11, 1:30 PM" },
        { level: "society_eb" as const, action: "pending" as const },
        { level: "society_president" as const, action: "pending" as const },
        { level: "faculty_admin" as const, action: "pending" as const },
      ],
    },
  ])

  const [bulkRequests, setBulkRequests] = useState([
    {
      id: "bulk-1",
      name: "Hackathon Prep",
      date: "2025-12-12",
      studentCount: 15,
      status: "pending_president_review",
      timestamp: "2 hours ago",
    },
    {
      id: "bulk-2",
      name: "Sports Practice",
      date: "2025-12-13",
      studentCount: 8,
      status: "pending_faculty_review",
      timestamp: "1 day ago",
    },
  ])

  const allStudents = [
    { id: "s1", name: "Rahul Kumar", rollNo: "CS21B001" },
    { id: "s2", name: "Priya Singh", rollNo: "CS21B002" },
    { id: "s3", name: "Amit Patel", rollNo: "CS21B003" },
    { id: "s4", name: "Neha Sharma", rollNo: "CS21B004" },
    { id: "s5", name: "Aditya Gupta", rollNo: "CS21B005" },
    { id: "s6", name: "Zara Khan", rollNo: "CS21B006" },
  ]

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleApproveIndividual = (id: string) => {
    setIncomingRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "pending_president_review",
              approvalHistory: req.approvalHistory.map((h) =>
                h.level === "society_eb"
                  ? { ...h, action: "approved" as const, timestamp: new Date().toLocaleString() }
                  : h,
              ),
            }
          : req,
      ),
    )
  }

  const handleRejectIndividual = (id: string) => {
    setIncomingRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "rejected",
              approvalHistory: req.approvalHistory.map((h) =>
                h.level === "society_eb"
                  ? { ...h, action: "rejected" as const, timestamp: new Date().toLocaleString() }
                  : h,
              ),
            }
          : req,
      ),
    )
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

  const pendingReviews = incomingRequests.filter((r) => r.status === "pending_eb_review")

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
                        <h3 className="font-semibold">{req.studentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {req.rollNo} | {req.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Date: {req.date} | Submitted: {req.submittedAt}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Awaiting Your Review</Badge>
                    </div>
                    <WorkflowTracker steps={req.approvalHistory} />
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
