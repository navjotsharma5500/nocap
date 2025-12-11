export type RequestStatus =
  | "pending_eb_review"
  | "pending_president_review"
  | "pending_faculty_review"
  | "approved_qr_generated"
  | "rejected"

export type ApprovalLevel = "student" | "society_eb" | "society_president" | "faculty_admin"

export interface PermissionRequest {
  id: string
  studentName: string
  rollNo: string
  hostel: string
  society?: string
  reason: string
  date: string
  requestedAt: string
  status: RequestStatus
  approvalHistory: {
    level: ApprovalLevel
    action: "approved" | "rejected" | "pending"
    timestamp?: string
    remarks?: string
  }[]
  qrToken?: string
  validUntil?: string
}

export interface BulkRequest {
  id: string
  society: string
  reason: string
  date: string
  students: { name: string; rollNo: string; hostel: string }[]
  submittedBy: string
  submittedAt: string
  status: RequestStatus
  approvalHistory: {
    level: ApprovalLevel
    action: "approved" | "rejected" | "pending"
    timestamp?: string
    remarks?: string
  }[]
}

// Mock data for demonstration
export const mockIndividualRequests: PermissionRequest[] = [
  {
    id: "ind-1",
    studentName: "Raj Kumar Singh",
    rollNo: "CS21B034",
    hostel: "B-Block",
    reason: "Library Project Work",
    date: "2025-12-11",
    requestedAt: "2 hours ago",
    status: "approved_qr_generated",
    qrToken: "QR-2025-CS21B034-001",
    validUntil: "2:00 AM",
    approvalHistory: [
      { level: "student", action: "approved", timestamp: "Dec 11, 10:00 AM" },
      { level: "society_eb", action: "approved", timestamp: "Dec 11, 10:30 AM" },
      { level: "society_president", action: "approved", timestamp: "Dec 11, 11:00 AM" },
      { level: "faculty_admin", action: "approved", timestamp: "Dec 11, 11:30 AM" },
    ],
  },
  {
    id: "ind-2",
    studentName: "Priya Singh",
    rollNo: "CS21B045",
    hostel: "A-Block",
    reason: "Emergency - Family Call",
    date: "2025-12-11",
    requestedAt: "1 hour ago",
    status: "pending_faculty_review",
    approvalHistory: [
      { level: "student", action: "approved", timestamp: "Dec 11, 11:00 AM" },
      { level: "society_eb", action: "approved", timestamp: "Dec 11, 11:15 AM" },
      { level: "society_president", action: "approved", timestamp: "Dec 11, 11:30 AM" },
      { level: "faculty_admin", action: "pending" },
    ],
  },
]

export const mockBulkRequests: BulkRequest[] = [
  {
    id: "bulk-1",
    society: "Tech Club",
    reason: "Hackathon Prep",
    date: "2025-12-12",
    students: [
      { name: "Rahul Kumar", rollNo: "CS21B001", hostel: "A-Block" },
      { name: "Amit Patel", rollNo: "CS21B002", hostel: "B-Block" },
      { name: "Neha Sharma", rollNo: "CS21B003", hostel: "C-Block" },
    ],
    submittedBy: "Priya Singh (EB)",
    submittedAt: "3 hours ago",
    status: "pending_president_review",
    approvalHistory: [
      { level: "society_eb", action: "approved", timestamp: "Dec 11, 9:00 AM" },
      { level: "society_president", action: "pending" },
      { level: "faculty_admin", action: "pending" },
    ],
  },
  {
    id: "bulk-2",
    society: "Sports Club",
    reason: "Annual Sports Meet Practice",
    date: "2025-12-13",
    students: [
      { name: "Vikram Desai", rollNo: "ME21B001", hostel: "D-Block" },
      { name: "Anjali Nair", rollNo: "ME21B002", hostel: "A-Block" },
    ],
    submittedBy: "Aditya Gupta (EB)",
    submittedAt: "5 hours ago",
    status: "pending_faculty_review",
    approvalHistory: [
      { level: "society_eb", action: "approved", timestamp: "Dec 11, 7:00 AM" },
      { level: "society_president", action: "approved", timestamp: "Dec 11, 8:00 AM" },
      { level: "faculty_admin", action: "pending" },
    ],
  },
]

export const getStatusLabel = (status: RequestStatus): string => {
  const labels: Record<RequestStatus, string> = {
    pending_eb_review: "Pending EB Review",
    pending_president_review: "Pending President Review",
    pending_faculty_review: "Pending Faculty Review",
    approved_qr_generated: "Approved - QR Generated",
    rejected: "Rejected",
  }
  return labels[status]
}

export const getStatusColor = (status: RequestStatus): string => {
  const colors: Record<RequestStatus, string> = {
    pending_eb_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending_president_review: "bg-orange-100 text-orange-800 border-orange-200",
    pending_faculty_review: "bg-blue-100 text-blue-800 border-blue-200",
    approved_qr_generated: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  }
  return colors[status]
}
