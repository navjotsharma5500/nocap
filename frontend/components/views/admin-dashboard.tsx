"use client"

import { useState, useEffect } from "react"
import { Check, X, Filter, Download, ArrowRight, Users, AlertTriangle, Clock, TrendingUp, Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkflowTracker from "@/components/workflow-tracker"
import { getStatusLabel, getStatusColor } from "@/lib/workflow-data"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface AdminStats {
  studentsCurrentlyOut: number
  studentsOutByDomain: { fest: number; society: number }
  todaysPermissions: { total: number; approved: number; pending: number; rejected: number }
  overdueStudents: Array<{ name: string; rollNo: string; society: string; expectedReturn: string; exitTime: string }>
  overdueCount: number
  permissionsByDomain: { fest: number; society: number }
  weeklyTrends: Array<{ date: string; count: number }>
  societies: Array<{ id: string; name: string; domain: string; memberCount: number; permissionCount: number }>
}

interface StudentOut {
  id: string
  name: string
  rollNo: string
  hostel: string
  society: string
  societyDomain: string
  reason: string
  exitTime: string
  expectedReturn: string
  isOverdue: boolean
  minutesOut: number
}

export default function AdminDashboard() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [filterDomain, setFilterDomain] = useState("all")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [studentsOut, setStudentsOut] = useState<StudentOut[]>([])
  const [activeView, setActiveView] = useState<"approvals" | "live">("live")

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [requestsRes, statsRes, studentsOutRes] = await Promise.all([
        fetch(`${API_URL}/api/approvals/faculty`),
        fetch(`${API_URL}/api/admin/stats`),
        fetch(`${API_URL}/api/admin/students-out`),
      ])

      const [requestsData, statsData, studentsOutData] = await Promise.all([
        requestsRes.json(),
        statsRes.json(),
        studentsOutRes.json(),
      ])

      setRequests(requestsData)
      setStats(statsData)
      setStudentsOut(studentsOutData.students || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedRequests((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleBulkAction = async (action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await Promise.all(
          selectedRequests.map((id) =>
            fetch(`${API_URL}/api/approvals/faculty/approve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requestId: id }),
            })
          )
        )
      } else {
        await Promise.all(
          selectedRequests.map((id) =>
            fetch(`${API_URL}/api/approvals/update`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requestId: id, status: 'REJECTED', type: 'permission' }),
            })
          )
        )
      }

      setSelectedRequests([])
      await fetchAllData()
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Failed to process bulk action')
    }
  }

  const filteredStudentsOut = filterDomain === "all"
    ? studentsOut
    : studentsOut.filter(s => s.societyDomain === filterDomain.toUpperCase())

  const filteredRequests = filterDomain === "all"
    ? requests
    : requests.filter(r => r.society?.domain === filterDomain.toUpperCase())

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Faculty Admin Dashboard</h1>
            <p className="text-muted-foreground">Live monitoring & approval management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAllData} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overdue Alert Banner */}
        {stats && stats.overdueCount > 0 && (
          <Card className="border-2 border-red-300 bg-red-50 animate-pulse">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">{stats.overdueCount} Student(s) Overdue</h3>
                  <p className="text-sm text-red-700">Students have not returned by their expected time</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setActiveView("live")}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats?.studentsCurrentlyOut || 0}</p>
              <p className="text-sm opacity-80">Currently Out</p>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  🎭 {stats?.studentsOutByDomain.fest || 0}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  🎓 {stats?.studentsOutByDomain.society || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats?.todaysPermissions.total || 0}</p>
              <p className="text-sm opacity-80">Today's Requests</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6 text-center">
              <Check className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats?.todaysPermissions.approved || 0}</p>
              <p className="text-sm opacity-80">Approved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats?.todaysPermissions.pending || 0}</p>
              <p className="text-sm opacity-80">Pending</p>
            </CardContent>
          </Card>

          <Card className={`${stats?.overdueCount ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' : 'bg-gradient-to-br from-slate-500 to-slate-600'} text-white`}>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p className="text-4xl font-bold">{stats?.overdueCount || 0}</p>
              <p className="text-sm opacity-80">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "approvals" | "live")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="live" className="gap-2">
              <Users className="w-4 h-4" />
              Live Tracking ({studentsOut.length})
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals ({requests.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Domain Filter */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Domain:</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filterDomain === "all" ? "default" : "outline"}
                  onClick={() => setFilterDomain("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterDomain === "fest" ? "default" : "outline"}
                  onClick={() => setFilterDomain("fest")}
                  className={filterDomain === "fest" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  🎭 Fest
                </Button>
                <Button
                  size="sm"
                  variant={filterDomain === "society" ? "default" : "outline"}
                  onClick={() => setFilterDomain("society")}
                  className={filterDomain === "society" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  🎓 Society
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Tracking View */}
        {activeView === "live" && (
          <>
            {/* Overdue Students Alert */}
            {stats && stats.overdueStudents.length > 0 && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue Students - Immediate Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.overdueStudents.map((student, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.rollNo} • {student.society}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-600 font-medium">Expected: {student.expectedReturn}</p>
                          <p className="text-xs text-muted-foreground">Left: {student.exitTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Students Currently Out */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Students Currently Out ({filteredStudentsOut.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredStudentsOut.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No students currently out</p>
                ) : (
                  <div className="space-y-3">
                    {filteredStudentsOut.map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border ${student.isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{student.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {student.societyDomain === 'FEST' ? '🎭 Fest' : '🎓 Society'}
                              </Badge>
                              {student.isOverdue && (
                                <Badge variant="destructive" className="text-xs gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{student.rollNo} • {student.society}</p>
                            <p className="text-sm mt-1">{student.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Exit: {student.exitTime}</p>
                            <p className="text-xs text-muted-foreground">Return by: {student.expectedReturn}</p>
                            <Badge variant="secondary" className="mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {Math.floor(student.minutesOut / 60)}h {student.minutesOut % 60}m out
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Approvals View */}
        {activeView === "approvals" && (
          <>
            {/* Bulk Actions */}
            {selectedRequests.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium flex-1">{selectedRequests.length} selected</span>
                    <Button
                      onClick={() => handleBulkAction("approve")}
                      size="sm"
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Approve & Generate QR
                    </Button>
                    <Button onClick={() => handleBulkAction("reject")} size="sm" variant="destructive" className="gap-1">
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Faculty Approval ({filteredRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {filteredRequests.map((req) => (
                      <div key={req.id} className="border border-slate-200 rounded-lg p-4 bg-white">
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
                                  <h3 className="font-semibold">{req.student?.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {req.society?.domain === 'FEST' ? '🎭 Fest' : '🎓 Society'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {req.student?.rollNo} | {req.society?.name}
                                </p>
                                <p className="text-sm mt-1">{req.reason}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Date: {new Date(req.date).toLocaleDateString()} | Exit: {req.exitTime} | Return: {req.returnTime || 'N/A'}
                                </p>
                              </div>
                              <Badge className={getStatusColor(req.status)}>
                                {getStatusLabel(req.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Workflow Info */}
        <Card className="border-2 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Approval Workflow</h3>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="px-3 py-1 bg-white rounded border">Student</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-white rounded border">Society EB</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-white rounded border">President</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 rounded font-semibold bg-primary text-primary-foreground">
                Faculty Admin (You)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-green-100 rounded border border-green-300">QR Token</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

