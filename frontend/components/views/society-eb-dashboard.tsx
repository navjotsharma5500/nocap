"use client"

import { useState, useEffect } from "react"
import { Plus, Users, FileText, Send, CheckCircle, XCircle, ArrowRight, Bell, Flag, AlertTriangle, RefreshCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
// Fallback ID for demo mode
const DEFAULT_SOCIETY_ID = "7369c6c1-3881-4ef3-a17a-390b63d4895e"

interface SocietyEBDashboardProps {
  societyId?: string
  societyName?: string
  userId?: string
}

interface Member {
  id: string
  name: string
  rollNo: string
  branch: string
  isFlagged: boolean
  flagType: string | null
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  metadata: any
  createdAt: string
}

interface SocietyStats {
  totalMembers: number
  flaggedMembers: number
  membersOut: number
}

export default function SocietyEBDashboard({ societyId, societyName, userId }: SocietyEBDashboardProps) {
  const SOCIETY_ID = societyId || DEFAULT_SOCIETY_ID
  const displayName = societyName || "Your Society"

  const [screen, setScreen] = useState<"list" | "create" | "review" | "members" | "flagged" | "activations">("list")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [pendingMembers, setPendingMembers] = useState<any[]>([])
  const [approvedMembers, setApprovedMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<SocietyStats | null>(null)
  const [flaggedMembers, setFlaggedMembers] = useState<any[]>([])
  const [reEvalDialogOpen, setReEvalDialogOpen] = useState(false)
  const [reEvalStudent, setReEvalStudent] = useState<any>(null)
  const [reEvalReason, setReEvalReason] = useState("")
  const [softFlagDialogOpen, setSoftFlagDialogOpen] = useState(false)
  const [softFlagStudent, setSoftFlagStudent] = useState<Member | null>(null)
  const [softFlagReason, setSoftFlagReason] = useState("")
  const [documentUrl, setDocumentUrl] = useState("")
  const [pendingActivations, setPendingActivations] = useState<any[]>([])

  // Fetch data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchPendingMembers(),
        fetchApprovedMembers(),
        fetchPendingRequests(),
        fetchStats(),
        fetchFlaggedMembers(),
        fetchNotifications(),
        fetchPendingActivations(),
      ])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eb/pending-members/${SOCIETY_ID}`)
      const data = await response.json()
      setPendingMembers(data)
    } catch (error) {
      console.error('Failed to fetch pending members:', error)
    }
  }

  const fetchApprovedMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eb/approved-members/${SOCIETY_ID}`)
      if (response.ok) {
        const data = await response.json()
        setApprovedMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch approved members:', error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/approvals/eb/${SOCIETY_ID}`)
      const data = await response.json()
      setIncomingRequests(data)
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eb/society-stats/${SOCIETY_ID}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchFlaggedMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eb/flagged-members/${SOCIETY_ID}`)
      if (response.ok) {
        const data = await response.json()
        setFlaggedMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch flagged members:', error)
    }
  }

  const fetchNotifications = async () => {
    if (!userId) return
    try {
      const response = await fetch(`${API_URL}/api/notifications/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchPendingActivations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/eb/pending-activations/${SOCIETY_ID}`)
      if (response.ok) {
        const data = await response.json()
        setPendingActivations(data)
      }
    } catch (error) {
      console.error('Failed to fetch pending activations:', error)
    }
  }

  const handleApproveActivation = async (permissionId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${API_URL}/api/eb/approve-activation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionId, action }),
      })

      if (response.ok) {
        await fetchPendingActivations()
        alert(action === 'approve' ? 'Permission activated! Student is now live.' : 'Activation rejected')
      } else {
        alert('Failed to process activation')
      }
    } catch (error) {
      console.error('Approve activation error:', error)
      alert('Failed to process activation')
    }
  }

  const [incomingRequests, setIncomingRequests] = useState<any[]>([])
  const [bulkRequests, setBulkRequests] = useState<any[]>([])

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
        await fetchAllData()
      } else {
        alert('Failed to process membership')
      }
    } catch (error) {
      console.error('Failed to approve member:', error)
      alert('Failed to process membership')
    }
  }

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
        await fetchPendingRequests()
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
        await fetchPendingRequests()
      } else {
        alert('Failed to reject request')
      }
    } catch (error) {
      console.error('Failed to reject:', error)
      alert('Failed to reject request')
    }
  }

  const handleSubmitBulkRequest = async (reason: string, startDate: string, endDate: string, exitTime: string, returnTime: string) => {
    try {
      const response = await fetch(`${API_URL}/api/eb/create-bulk-request-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          societyId: SOCIETY_ID,
          createdBy: userId || 'eb-user',
          reason,
          startDate,
          endDate: endDate || startDate, // If no end date, use start date
          exitTime,
          returnTime,
          documentUrl: documentUrl || null,
          studentIds: selectedStudents,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBulkRequests([data.bulkRequest, ...bulkRequests])
        setSelectedStudents([])
        setDocumentUrl("")
        setScreen("list")
        alert('Bulk request submitted to President!')
      } else {
        alert('Failed to submit bulk request')
      }
    } catch (error) {
      console.error('Failed to submit bulk request:', error)
      alert('Failed to submit bulk request')
    }
  }

  const handleRequestReEval = async () => {
    if (!reEvalStudent || !reEvalReason.trim()) return

    try {
      const response = await fetch(`${API_URL}/api/eb/request-re-evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: reEvalStudent.id,
          reason: reEvalReason,
          requestedBy: userId || 'eb-user',
          societyId: SOCIETY_ID,
        }),
      })

      if (response.ok) {
        setReEvalDialogOpen(false)
        setReEvalReason("")
        setReEvalStudent(null)
        alert('Re-evaluation request sent to DOSA!')
      } else {
        alert('Failed to send re-evaluation request')
      }
    } catch (error) {
      console.error('Re-eval error:', error)
      alert('Failed to send request')
    }
  }

  const handleSoftFlag = async () => {
    if (!softFlagStudent || !softFlagReason.trim()) return

    try {
      const response = await fetch(`${API_URL}/api/eb/soft-flag-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: softFlagStudent.id,
          reason: softFlagReason,
          flaggedBy: 'Society EB',
          societyId: SOCIETY_ID,
        }),
      })

      if (response.ok) {
        setSoftFlagDialogOpen(false)
        setSoftFlagReason("")
        setSoftFlagStudent(null)
        await fetchAllData()
      } else {
        alert('Failed to flag member')
      }
    } catch (error) {
      console.error('Soft flag error:', error)
      alert('Failed to flag member')
    }
  }

  const pendingReviews = incomingRequests.filter((r) => r.status === "PENDING_EB")
  const unreadNotifications = notifications.filter(n => !n.isRead && n.type === 'MEMBER_FLAGGED')

  // Flagged Members View
  if (screen === "flagged") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" onClick={() => setScreen("list")} className="mb-6">
            ← Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600" />
                Flagged Society Members ({flaggedMembers.length})
              </CardTitle>
              <CardDescription>Members flagged by DOSA or EB</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flaggedMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No flagged members</p>
              ) : (
                flaggedMembers.map((member) => (
                  <div key={member.id} className="border border-red-200 rounded-lg p-4 bg-red-50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.rollNo}</p>
                        <p className="text-xs text-red-600 mt-1">
                          Flagged by: {member.flaggedBy} | Reason: {member.flagReason}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {member.flagType === 'HARD' ? 'DOSA Flag' : 'Soft Flag'}
                      </Badge>
                    </div>
                    {member.flagType === 'HARD' && (
                      <Button
                        onClick={() => { setReEvalStudent(member); setReEvalDialogOpen(true); }}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Request Re-evaluation from DOSA
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Re-evaluation Dialog */}
        <Dialog open={reEvalDialogOpen} onOpenChange={setReEvalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Re-evaluation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Student: <strong>{reEvalStudent?.name}</strong> ({reEvalStudent?.rollNo})
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Detailed Reason for Re-evaluation</label>
                <Textarea
                  value={reEvalReason}
                  onChange={(e) => setReEvalReason(e.target.value)}
                  placeholder="Provide a detailed reason why this student should be re-evaluated..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReEvalDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRequestReEval} disabled={!reEvalReason.trim()}>
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Pending Activations Screen
  if (screen === "activations") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" onClick={() => setScreen("list")} className="mb-6">
            ← Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                Pending Activation Requests
              </CardTitle>
              <CardDescription>
                Students requesting to activate their permission without hostel scan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingActivations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending activation requests</p>
              ) : (
                pendingActivations.map((perm) => (
                  <div key={perm.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{perm.student?.name}</h3>
                        <p className="text-sm text-muted-foreground">{perm.student?.rollNo}</p>
                        <p className="text-sm mt-1">{perm.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Date: {new Date(perm.date).toLocaleDateString()} | Exit: {perm.exitTime} | Return: {perm.returnTime || 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Pending Activation
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveActivation(perm.id, 'approve')}
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve (Go Live)
                      </Button>
                      <Button
                        onClick={() => handleApproveActivation(perm.id, 'reject')}
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
              <CardDescription>Select approved members for society activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Workflow Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium mb-2">Bulk Request Workflow:</p>
                <p className="text-xs text-blue-600">EB Submits → President Review → DOSA Representative (Final) → QR Tokens</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Activity / Reason</label>
                <Input placeholder="e.g., Hackathon Prep, Sports Event..." id="reason" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input type="date" id="startDate" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date (optional)</label>
                  <Input type="date" id="endDate" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Exit Time</label>
                  <Input type="time" id="exitTime" defaultValue="20:00" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Return Time</label>
                  <Input type="time" id="returnTime" defaultValue="23:00" />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Attach Document (URL)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://drive.google.com/... or document URL"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                  />
                  <Button variant="outline" className="gap-1">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Provide a link to supporting documents (Google Drive, etc.)</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Select Approved Members ({selectedStudents.length} selected)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-slate-200 p-3 rounded-lg">
                  {approvedMembers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No approved members yet</p>
                  ) : (
                    approvedMembers.map((member) => (
                      <label
                        key={member.id}
                        className={`flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 rounded ${member.isFlagged ? 'bg-red-50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(member.id)}
                          onChange={() => toggleStudent(member.id)}
                          className="w-4 h-4"
                          disabled={member.isFlagged}
                        />
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.rollNo}</span>
                        {member.isFlagged && (
                          <Badge variant="destructive" className="text-xs ml-auto">Flagged</Badge>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <Button
                onClick={() => {
                  const reason = (document.getElementById("reason") as HTMLInputElement)?.value
                  const startDate = (document.getElementById("startDate") as HTMLInputElement)?.value
                  const endDate = (document.getElementById("endDate") as HTMLInputElement)?.value
                  const exitTime = (document.getElementById("exitTime") as HTMLInputElement)?.value
                  const returnTime = (document.getElementById("returnTime") as HTMLInputElement)?.value

                  if (!reason) {
                    alert('Please enter an activity/reason')
                    return
                  }
                  if (!startDate) {
                    alert('Please select a start date')
                    return
                  }
                  if (!exitTime) {
                    alert('Please enter exit time')
                    return
                  }
                  if (selectedStudents.length === 0) {
                    alert('Please select at least one student')
                    return
                  }

                  handleSubmitBulkRequest(reason, startDate, endDate, exitTime, returnTime)
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

        {/* Flagged Notification Banner */}
        {unreadNotifications.length > 0 && (
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">{unreadNotifications.length} Member(s) Flagged by DOSA</h3>
                  <p className="text-sm text-red-700">Your society members have been flagged. Review and request re-evaluation if needed.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setScreen("flagged")}>
                  View Flagged
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Members</p>
              <p className="text-3xl font-bold text-blue-700">{stats?.totalMembers || 0}</p>
            </CardContent>
          </Card>
          <Card className={`${stats?.flaggedMembers ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Flagged Members</p>
              <p className={`text-3xl font-bold ${stats?.flaggedMembers ? 'text-red-700' : 'text-slate-700'}`}>
                {stats?.flaggedMembers || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Members Out</p>
              <p className="text-3xl font-bold text-orange-700">{stats?.membersOut || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Pending Your Review</p>
              <p className="text-3xl font-bold text-yellow-700">{pendingReviews.length}</p>
            </CardContent>
          </Card>
          <Card
            className={`${pendingActivations.length > 0 ? 'bg-purple-50 border-purple-200 cursor-pointer hover:shadow-md' : 'bg-slate-50 border-slate-200'}`}
            onClick={() => pendingActivations.length > 0 && setScreen("activations")}
          >
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Activation Requests</p>
              <p className={`text-3xl font-bold ${pendingActivations.length > 0 ? 'text-purple-700' : 'text-slate-700'}`}>
                {pendingActivations.length}
              </p>
              {pendingActivations.length > 0 && (
                <p className="text-xs text-purple-600 mt-1">Click to review</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Bulk Requests Sent</p>
              <p className="text-3xl font-bold text-green-700">{bulkRequests.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* View Flagged Members */}
          <Card className="bg-red-50 border-red-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setScreen("flagged")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Flagged Members</h3>
                  <p className="text-sm text-muted-foreground">View and request re-evaluation</p>
                </div>
                <Badge variant="destructive" className="ml-auto">{flaggedMembers.length}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Soft Flag Member */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSoftFlagDialogOpen(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Flag className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Soft Flag Member</h3>
                  <p className="text-sm text-muted-foreground">Flag a member for internal tracking</p>
                </div>
              </div>
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
              <span className="px-3 py-1 bg-slate-200 rounded">DOSA Representative (Final)</span>
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
            {bulkRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bulk requests yet. Create one to get started!</p>
            ) : (
              <div className="space-y-3">
                {bulkRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{req.reason || req.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {req.permissionRequests?.length || req.studentCount} students | {req.date ? new Date(req.date).toLocaleDateString() : req.date}
                      </p>
                      {req.documentUrl && (
                        <a href={req.documentUrl} target="_blank" rel="noopener" className="text-xs text-blue-600 underline">
                          View Attached Document
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(req.status as any)}>{getStatusLabel(req.status as any)}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : req.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Soft Flag Dialog */}
      <Dialog open={softFlagDialogOpen} onOpenChange={setSoftFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Soft Flag Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Member</label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {approvedMembers.filter(m => !m.isFlagged).map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-100 ${softFlagStudent?.id === member.id ? 'bg-blue-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="flagMember"
                      checked={softFlagStudent?.id === member.id}
                      onChange={() => setSoftFlagStudent(member)}
                    />
                    <span className="text-sm">{member.name} ({member.rollNo})</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for Flagging</label>
              <Textarea
                value={softFlagReason}
                onChange={(e) => setSoftFlagReason(e.target.value)}
                placeholder="Internal tracking reason..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSoftFlagDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSoftFlag} disabled={!softFlagStudent || !softFlagReason.trim()}>
              Flag Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-eval Dialog (used from flagged screen) */}
      <Dialog open={reEvalDialogOpen} onOpenChange={setReEvalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Re-evaluation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Student: <strong>{reEvalStudent?.name}</strong> ({reEvalStudent?.rollNo})
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Detailed Reason for Re-evaluation</label>
              <Textarea
                value={reEvalReason}
                onChange={(e) => setReEvalReason(e.target.value)}
                placeholder="Provide a detailed reason why this student should be re-evaluated..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReEvalDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestReEval} disabled={!reEvalReason.trim()}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
