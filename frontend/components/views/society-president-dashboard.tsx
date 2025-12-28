"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Inbox, ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
// Fallback ID for demo mode
const DEFAULT_SOCIETY_ID = "7369c6c1-3881-4ef3-a17a-390b63d4895e"

interface SocietyPresidentDashboardProps {
  societyId?: string
  societyName?: string
}

export default function SocietyPresidentDashboard({ societyId, societyName }: SocietyPresidentDashboardProps) {
  const SOCIETY_ID = societyId || DEFAULT_SOCIETY_ID
  const displayName = societyName || "Your Society"

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/approvals/president/${SOCIETY_ID}`)
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
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
        await fetchRequests() // Refresh list
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
        await fetchRequests() // Refresh list
      } else {
        alert('Failed to reject request')
      }
    } catch (error) {
      console.error('Failed to reject:', error)
      alert('Failed to reject request')
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
          <p className="text-muted-foreground">Level 2 Review - Mark Approval & Forward to Faculty Admin</p>
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
              <span className="px-3 py-1 bg-slate-200 rounded">Faculty Admin (Final)</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Pending Your Review</p>
              <p className="text-3xl font-bold text-orange-700">{pendingRequests.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Forwarded to Faculty</p>
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

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Pending Your Approval ({pendingRequests.length})
            </CardTitle>
            <CardDescription>Requests forwarded by Society EB awaiting your review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">All requests processed!</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
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
                        {req.rollNo} | {req.reason}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Date: {req.date} | From: {req.ebName}
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Awaiting Your Review</Badge>
                  </div>
                  {/* Workflow removed */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Forward to Faculty
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
              <CardTitle>Forwarded to Faculty Admin</CardTitle>
              <CardDescription>Requests you've approved and sent forward</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {forwardedRequests.map((req) => (
                <div key={req.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{req.studentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {req.rollNo} | {req.reason}
                      </p>
                    </div>
                    <Badge className={getStatusColor(req.status as any)}>{getStatusLabel(req.status as any)}</Badge>
                  </div>
                  {/* Workflow removed */}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
