export type UserRole = 'Student' | 'Society_EB' | 'Society_President' | 'Faculty_Admin' | 'Guard';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  photo: string;
  hostel: string;
  room: string;
}

export interface PermissionRequest {
  id: string;
  students: Student[];
  society: string;
  reason: string;
  date: string;
  status: 'pending_president' | 'pending_dosa' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
}

export interface PermissionHistory {
  id: string;
  date: string;
  exitTime: string;
  returnTime?: string;
  reason: string;
  status: 'completed' | 'active' | 'expired';
}
