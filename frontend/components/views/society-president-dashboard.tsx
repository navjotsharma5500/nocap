"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Inbox, ArrowRight, Users, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
// Fallback ID for demo mode
const DEFAULT_SOCIETY_ID = "7369c6c1-3881-4ef3-a17a-390b63d4895e"

interface SocietyPresidentDashboardProps {
  societyId?: string
  societyName?: string
}

interface BulkRequest {
  id: string
  reason: string
  date: string
  exitTime: string
  returnTime: string
  documentUrl: string | null
  status: string
  createdAt: string
  society: { name: string }
  permissionRequests: Array<{ id: string; student: { name: string; rollNo: string } }>
}

export default function SocietyPresidentDashboard({ societyId, societyName }: SocietyPresidentDashboardProps) {
  const SOCIETY_ID = societyId || DEFAULT_SOCIETY_ID
  const displayName = societyName || "Your Society"

  const [requests, setRequests] = useState<any[]>([])
  const [bulkRequests, setBulkRequests] = useState<BulkRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchRequests(), fetchBulkRequests()])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/approvals/president/${SOCIETY_ID}`)
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    }
  }

  const fetchBulkRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/president/pending-bulk-requests/${SOCIETY_ID}`)
      if (response.ok) {
        const data = await response.json()
        setBulkRequests(data)
      }
    } catch (error) {
      console.error('Failed to fetch bulk requests:', error)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/approvals/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          status: 'PENDING_FACULTY',
          type: 'permission',
        }),
      })

      if (response.ok) {
        await fetchAllData()
      } else {
        alert('Failed to approve request')
      }
    } catch (error) {
      console.error('Failed to approve:', error)
      alert('Failed to approve request')
    }
  }

  const handleReject = async (id: string) => {
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
        await fetchAllData()
      } else {
        alert('Failed to reject request')
      }
    } catch (error) {
      console.error('Failed to reject:', error)
      alert('Failed to reject request')
    }
  }

  const handleBulkAction = async (bulkRequestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${API_URL}/api/president/approve-bulk-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkRequestId, action }),
      })

      if (response.ok) {
        await fetchAllData()
        alert(action === 'approve' ? 'Bulk request forwarded to DOSA!' : 'Bulk request rejected')
      } else {
        alert('Failed to process bulk request')
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Failed to process bulk request')
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING_PRESIDENT")
  const forwardedRequests = requests.filter(
    (r) => r.status === "PENDING_FACULTY" || r.status === "APPROVED",
  )

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Society President Dashboard</h1>
          <p className="text-muted-foreground">Level 2 Review - Mark Approval & Forward to DOSA Representative</p>
        </div>

        {/* Workflow Info */}
        <Card className="bg-gradient-to-r from-orange-50 to-slate-50 border-orange-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Your Role in the Workflow</h3>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="px-3 py-1 bg-slate-200 rounded">Student</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-slate-200 rounded">Society EB</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded font-semibold">
                President (You)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-slate-200 rounded">DOSA Representative (Final)</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Pending Bulk Requests</p>
              <p className="text-3xl font-bold text-purple-700">{bulkRequests.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Pending Individual</p>
              <p className="text-3xl font-bold text-orange-700">{pendingRequests.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Forwarded to DOSA</p>
              <p className="text-3xl font-bold text-blue-700">{forwardedRequests.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-slate-700">{requests.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Requests Section */}
        {bulkRequests.length > 0 && (
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Users className="w-5 h-5" />
                Pending Bulk Requests from EB ({bulkRequests.length})
              </CardTitle>
              <CardDescription>Review bulk permission requests submitted by Society EB</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bulkRequests.map((bulk) => (
                <div key={bulk.id} className="border border-purple-200 rounded-lg p-4 space-y-3 bg-purple-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{bulk.reason}</h3>
                      <p className="text-sm text-muted-foreground">
                        {bulk.permissionRequests.length} students | Date: {new Date(bulk.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Exit: {bulk.exitTime} | Return: {bulk.returnTime || 'N/A'}
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Bulk Request</Badge>
                  </div>

                  {/* Document Link */}
                  {bulk.documentUrl && (
                    <div className="flex items-center gap-2 bg-white p-2 rounded border">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <a
                        href={bulk.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline hover:text-blue-800 flex items-center gap-1"
                      >
                        View Attached Document
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Student List */}
                  <div className="bg-white rounded border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Students in this request:</p>
                    <div className="flex flex-wrap gap-2">
                      {bulk.permissionRequests.map((pr) => (
                        <Badge key={pr.id} variant="secondary" className="text-xs">
                          {pr.student.name} ({pr.student.rollNo})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBulkAction(bulk.id, 'approve')}
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve All & Forward to DOSA
                    </Button>
                    <Button
                      onClick={() => handleBulkAction(bulk.id, 'reject')}
                      variant="destructive"
                      className="flex-1 gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject All
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Individual Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Individual Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Requests forwarded by Society EB awaiting your review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">All individual requests processed!</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{req.student?.name || req.studentName}</h3>
                        {req.type === "bulk" && (
                          <Badge variant="outline" className="gap-1">
                            <Users className="w-3 h-3" />
                            Bulk
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {req.student?.rollNo || req.rollNo} | {req.reason}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Date: {new Date(req.date).toLocaleDateString()} | Exit: {req.exitTime}
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Awaiting Your Review</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Forward to DOSA
                    </Button>
                    <Button onClick={() => handleReject(req.id)} variant="destructive" className="flex-1 gap-2">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Forwarded Requests */}
        {forwardedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Forwarded to DOSA Representative</CardTitle>
              <CardDescription>Requests you've approved and sent forward</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {forwardedRequests.map((req) => (
                <div key={req.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{req.student?.name || req.studentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {req.student?.rollNo || req.rollNo} | {req.reason}
                      </p>
                    </div>
                    <Badge className={getStatusColor(req.status as any)}>{getStatusLabel(req.status as any)}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
