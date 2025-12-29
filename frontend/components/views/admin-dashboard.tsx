"use client"

import { useState, useEffect } from "react"
import { Check, X, Filter, Download, ArrowRight, Users, AlertTriangle, Clock, TrendingUp, Calendar, RefreshCw, Flag, Search, FileText, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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

interface Student {
  id: string
  name: string
  rollNo: string
  branch: string
  year: string
  isFlagged: boolean
  flagType: string | null
  flagReason: string | null
}

interface AcademicPermission {
  id: string
  studentId: string
  reason: string
  date: string
  department: string
  exitTime: string
  returnTime: string
  status: string
  student: { name: string; rollNo: string }
}

export default function AdminDashboard() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [filterDomain, setFilterDomain] = useState("all")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [studentsOut, setStudentsOut] = useState<StudentOut[]>([])
  const [activeView, setActiveView] = useState<"live" | "approvals" | "academic" | "students">("live")
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [academicPermissions, setAcademicPermissions] = useState<AcademicPermission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [flagReason, setFlagReason] = useState("")
  const [academicDialogOpen, setAcademicDialogOpen] = useState(false)
  const [newAcademicForm, setNewAcademicForm] = useState({
    studentId: "",
    reason: "",
    date: "",
    department: "",
    exitTime: "",
    returnTime: ""
  })

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [requestsRes, statsRes, studentsOutRes, listsRes] = await Promise.all([
        fetch(`${API_URL}/api/approvals/faculty`),
        fetch(`${API_URL}/api/admin/stats`),
        fetch(`${API_URL}/api/admin/students-out`),
        fetch(`${API_URL}/api/admin/permission-lists`),
      ])

      const [requestsData, statsData, studentsOutData, listsData] = await Promise.all([
        requestsRes.json(),
        statsRes.json(),
        studentsOutRes.json(),
        listsRes.ok ? listsRes.json() : { allStudents: [], academicPermissions: [] },
      ])

      setRequests(requestsData)
      setStats(statsData)
      setStudentsOut(studentsOutData.students || [])
      setAllStudents(listsData.allStudents || [])
      setAcademicPermissions(listsData.academicPermissions || [])
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

  const handleFlagStudent = async () => {
    if (!selectedStudent || !flagReason.trim()) return

    try {
      const res = await fetch(`${API_URL}/api/admin/flag-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          reason: flagReason,
          flaggedBy: 'DOSA Representative',
        }),
      })

      if (res.ok) {
        setFlagDialogOpen(false)
        setFlagReason("")
        setSelectedStudent(null)
        await fetchAllData()
      } else {
        alert('Failed to flag student')
      }
    } catch (error) {
      console.error('Flag student error:', error)
      alert('Failed to flag student')
    }
  }

  const handleDeflagStudent = async (studentId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/deflag-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })

      if (res.ok) {
        await fetchAllData()
      } else {
        alert('Failed to remove flag')
      }
    } catch (error) {
      console.error('Deflag error:', error)
      alert('Failed to remove flag')
    }
  }

  const handleCreateAcademicPermission = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/academic-permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAcademicForm),
      })

      if (res.ok) {
        setAcademicDialogOpen(false)
        setNewAcademicForm({ studentId: "", reason: "", date: "", department: "", exitTime: "", returnTime: "" })
        await fetchAllData()
      } else {
        alert('Failed to create academic permission')
      }
    } catch (error) {
      console.error('Create academic permission error:', error)
    }
  }

  const handleApproveAcademicPermission = async (permissionId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/academic-permissions/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionId }),
      })

      if (res.ok) {
        await fetchAllData()
      } else {
        alert('Failed to approve academic permission')
      }
    } catch (error) {
      console.error('Approve academic permission error:', error)
    }
  }

  const filteredStudentsOut = filterDomain === "all"
    ? studentsOut
    : studentsOut.filter(s => s.societyDomain === filterDomain.toUpperCase())

  const filteredRequests = filterDomain === "all"
    ? requests
    : requests.filter(r => r.society?.domain === filterDomain.toUpperCase())

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">DOSA Representative Dashboard</h1>
            <p className="text-muted-foreground">Live monitoring, approval management & student flagging</p>
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
                  Fest: {stats?.studentsOutByDomain.fest || 0}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Society: {stats?.studentsOutByDomain.society || 0}
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
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="live" className="gap-2">
              <Users className="w-4 h-4" />
              Live ({studentsOut.length})
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <Clock className="w-4 h-4" />
              Approvals ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="academic" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Flag className="w-4 h-4" />
              Students
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Domain Filter - for Live and Approvals views */}
        {(activeView === "live" || activeView === "approvals") && (
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
                    Fest
                  </Button>
                  <Button
                    size="sm"
                    variant={filterDomain === "society" ? "default" : "outline"}
                    onClick={() => setFilterDomain("society")}
                    className={filterDomain === "society" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Society
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                          <p className="text-sm text-muted-foreground">{student.rollNo} - {student.society}</p>
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
                                {student.societyDomain === 'FEST' ? 'Fest' : 'Society'}
                              </Badge>
                              {student.isOverdue && (
                                <Badge variant="destructive" className="text-xs gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{student.rollNo} - {student.society}</p>
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
                  Pending DOSA Approval ({filteredRequests.length})
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
                                    {req.society?.domain === 'FEST' ? 'Fest' : 'Society'}
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

        {/* Academic Permissions View */}
        {activeView === "academic" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Academic Permissions
                </CardTitle>
                <Button onClick={() => setAcademicDialogOpen(true)} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Add Academic Permission
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {academicPermissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No academic permissions</p>
              ) : (
                <div className="space-y-3">
                  {academicPermissions.map((perm) => (
                    <div key={perm.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{perm.student?.name}</h3>
                          <p className="text-sm text-muted-foreground">{perm.student?.rollNo} | {perm.department}</p>
                          <p className="text-sm mt-1">{perm.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Date: {new Date(perm.date).toLocaleDateString()} | Exit: {perm.exitTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(perm.status)}>
                            {getStatusLabel(perm.status)}
                          </Badge>
                          {perm.status === 'PENDING_FACULTY' && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveAcademicPermission(perm.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Students View - Flagging */}
        {activeView === "students" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Management & Flagging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Student List */}
              <div className="space-y-2">
                {filteredStudents.slice(0, 20).map((student) => (
                  <div key={student.id} className={`flex items-center justify-between p-3 rounded-lg border ${student.isFlagged ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{student.name}</h4>
                        {student.isFlagged && (
                          <Badge variant="destructive" className="text-xs">
                            <Flag className="w-3 h-3 mr-1" />
                            {student.flagType === 'HARD' ? 'Flagged' : 'Soft Flag'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{student.rollNo} | {student.branch} | {student.year}</p>
                      {student.isFlagged && student.flagReason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {student.flagReason}</p>
                      )}
                    </div>
                    <div>
                      {student.isFlagged ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeflagStudent(student.id)}
                          className="gap-1"
                        >
                          <X className="w-4 h-4" />
                          Remove Flag
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedStudent(student); setFlagDialogOpen(true); }}
                          className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Flag className="w-4 h-4" />
                          Flag Student
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                DOSA Representative (You)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="px-3 py-1 bg-green-100 rounded border border-green-300">QR Token</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Student: <strong>{selectedStudent?.name}</strong> ({selectedStudent?.rollNo})
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for Flagging</label>
              <Textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Enter reason for flagging this student..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleFlagStudent} disabled={!flagReason.trim()}>
              Flag Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Academic Permission Dialog */}
      <Dialog open={academicDialogOpen} onOpenChange={setAcademicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Academic Permission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Student ID</label>
              <Select value={newAcademicForm.studentId} onValueChange={(v) => setNewAcademicForm({ ...newAcademicForm, studentId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.slice(0, 50).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Input
                value={newAcademicForm.department}
                onChange={(e) => setNewAcademicForm({ ...newAcademicForm, department: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Textarea
                value={newAcademicForm.reason}
                onChange={(e) => setNewAcademicForm({ ...newAcademicForm, reason: e.target.value })}
                placeholder="Reason for academic permission..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={newAcademicForm.date}
                  onChange={(e) => setNewAcademicForm({ ...newAcademicForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Exit Time</label>
                <Input
                  type="time"
                  value={newAcademicForm.exitTime}
                  onChange={(e) => setNewAcademicForm({ ...newAcademicForm, exitTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcademicDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAcademicPermission}>Create Permission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
