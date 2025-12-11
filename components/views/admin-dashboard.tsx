"use client"

import { useState } from "react"
import { Check, X, Filter, Download, Table, ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import WorkflowTracker from "@/components/workflow-tracker"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

export default function AdminDashboard() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [filterSociety, setFilterSociety] = useState("all")

  const [requests, setRequests] = useState([
    {
      id: "1",
      type: "individual",
      studentName: "Sneha Patel",
      rollNo: "CS21B051",
      society: "Tech Club",
      reason: "Competition preparation",
      date: "2025-12-11",
      hostel: "A-Block",
      status: "pending_faculty_review",
      approvalHistory: [
        { level: "student" as const, action: "approved" as const },
        { level: "society_eb" as const, action: "approved" as const },
        { level: "society_president" as const, action: "approved" as const },
        { level: "faculty_admin" as const, action: "pending" as const },
      ],
    },
    {
      id: "2",
      type: "bulk",
      studentName: "Sports Team",
      rollNo: "8 students",
      society: "Sports Club",
      reason: "Annual Meet Practice",
      date: "2025-12-13",
      hostel: "Multiple",
      status: "pending_faculty_review",
      approvalHistory: [
        { level: "society_eb" as const, action: "approved" as const },
        { level: "society_president" as const, action: "approved" as const },
        { level: "faculty_admin" as const, action: "pending" as const },
      ],
    },
    {
      id: "4",
      type: "bulk",
      studentName: "Hackathon Team",
      rollNo: "15 students",
      society: "Tech Club",
      reason: "Hackathon Prep",
      date: "2025-12-12",
      hostel: "Multiple",
      status: "approved_qr_generated",
      approvalHistory: [
        { level: "society_eb" as const, action: "approved" as const },
        { level: "society_president" as const, action: "approved" as const },
        { level: "faculty_admin" as const, action: "approved" as const },
      ],
    },
  ])

  const toggleSelect = (id: string) => {
    setSelectedRequests((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleBulkAction = (action: "approve" | "reject") => {
    const nextStatus = action === "approve" ? "approved_qr_generated" : "rejected"

    setRequests((prev) =>
      prev.map((req) =>
        selectedRequests.includes(req.id)
          ? {
              ...req,
              status: nextStatus,
              approvalHistory: req.approvalHistory.map((h) =>
                h.level === "faculty_admin"
                  ? { ...h, action: action === "approve" ? ("approved" as const) : ("rejected" as const) }
                  : h,
              ),
            }
          : req,
      ),
    )
    setSelectedRequests([])
  }

  const societies = ["Tech Club", "Sports Club", "Debate Society", "Music Club"]

  const facultyPending = requests.filter((r) => r.status === "pending_faculty_review")
  const approved = requests.filter((r) => r.status === "approved_qr_generated")

  const currentRequests =
    filterSociety === "all"
      ? facultyPending
      : facultyPending.filter((r) => r.society === filterSociety)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {activeTab === "faculty" ? "Faculty Admin Dashboard" : "DoSA Office Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "faculty" ? "Final Oversight & Approval" : "Super Admin - Final Approval & QR Generation"}
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        {/* Workflow Info */}
        <Card className="border-2 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Current Role in Workflow</h3>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="px-3 py-1 bg-white rounded border">Student</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-white rounded border">Society EB</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-white rounded border">President</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 rounded font-semibold bg-primary text-primary-foreground">
                Faculty Admin (Final)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-green-100 rounded border border-green-300">QR Token</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Faculty Pending</p>
              <p className="text-3xl font-bold text-blue-700">{facultyPending.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">QR Generated</p>
              <p className="text-3xl font-bold text-green-700">{approved.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
              <p className="text-3xl font-bold">{requests.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Bulk Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Society</label>
                <Select value={filterSociety} onValueChange={setFilterSociety}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Societies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Societies</SelectItem>
                    {societies.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input placeholder="Search by name or roll number..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input type="date" />
              </div>
            </div>

            {selectedRequests.length > 0 && (
              <div className="flex gap-2 p-3 bg-blue-50 rounded-lg items-center">
                <span className="text-sm font-medium flex-1">{selectedRequests.length} selected</span>
                <Button
                  onClick={() => handleBulkAction("approve")}
                  size="sm"
                  className="gap-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Final Approve & Generate QR
                </Button>
                <Button onClick={() => handleBulkAction("reject")} size="sm" variant="destructive" className="gap-1">
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="w-5 h-5" />
              Pending Faculty Review ({currentRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {currentRequests.map((req) => (
                  <div key={req.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(req.id)}
                        onChange={() => toggleSelect(req.id)}
                        className="w-4 h-4 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{req.studentName}</h3>
                              {req.type === "bulk" && (
                                <Badge variant="outline" className="gap-1">
                                  <Users className="w-3 h-3" />
                                  Bulk
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {req.rollNo} | {req.society} | {req.hostel}
                            </p>
                            <p className="text-sm">{req.reason}</p>
                            <p className="text-xs text-muted-foreground mt-1">Date: {req.date}</p>
                          </div>
                          <Badge className={getStatusColor(req.status as any)}>
                            {getStatusLabel(req.status as any)}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <WorkflowTracker steps={req.approvalHistory} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved & QR Generated */}
        {approved.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Fully Approved - QR Tokens Generated</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {approved.map((req) => (
                <div key={req.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{req.studentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {req.rollNo} | {req.society}
                      </p>
                    </div>
                    <Badge className="bg-green-600">QR Active</Badge>
                  </div>
                  <WorkflowTracker steps={req.approvalHistory} compact />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
