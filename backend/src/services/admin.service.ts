import { prisma } from '../lib/prisma';

// Helper function to parse time string to Date
function parseTimeString(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  if (hours < 12 && hours < 6) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

export class AdminService {
  /**
   * Get students currently out
   */
  async getStudentsOut() {
    const studentsOut = await prisma.permissionRequest.findMany({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
      include: {
        student: true,
        society: true,
      },
      orderBy: { verifiedAt: 'asc' },
    });

    const now = new Date();
    const students = studentsOut.map((req) => {
      const returnTime = req.returnTime ? parseTimeString(req.returnTime, req.date) : null;
      const isOverdue = returnTime ? now > returnTime : false;

      return {
        id: req.id,
        name: req.student.name,
        rollNo: req.student.rollNo,
        hostel: req.student.branch ? `${req.student.branch}-Block` : 'Unknown',
        society: req.society.name,
        societyDomain: req.society.domain,
        reason: req.reason,
        exitTime: req.verifiedAt?.toLocaleString() || 'Unknown',
        expectedReturn: req.returnTime || 'Not specified',
        isOverdue,
        minutesOut: req.verifiedAt
          ? Math.round((now.getTime() - req.verifiedAt.getTime()) / (1000 * 60))
          : 0,
      };
    });

    return {
      total: students.length,
      students,
      festCount: students.filter((s) => s.societyDomain === 'FEST').length,
      societyCount: students.filter((s) => s.societyDomain === 'SOCIETY').length,
    };
  }

  /**
   * Get comprehensive stats
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysRequests = await prisma.permissionRequest.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: { society: true },
    });

    const studentsOut = await prisma.permissionRequest.findMany({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
      include: { student: true, society: true },
    });

    const now = new Date();
    const overdueStudents = studentsOut.filter((req) => {
      if (!req.returnTime) return false;
      const returnTime = parseTimeString(req.returnTime, req.date);
      return now > returnTime;
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyData = await prisma.permissionRequest.groupBy({
      by: ['date'],
      where: { createdAt: { gte: weekAgo } },
      _count: { id: true },
      orderBy: { date: 'asc' },
    });

    const societies = await prisma.society.findMany({
      include: {
        _count: { select: { members: true, permissionRequests: true } },
      },
    });

    return {
      studentsCurrentlyOut: studentsOut.length,
      studentsOutByDomain: {
        fest: studentsOut.filter((s) => s.society.domain === 'FEST').length,
        society: studentsOut.filter((s) => s.society.domain === 'SOCIETY').length,
      },
      todaysPermissions: {
        total: todaysRequests.length,
        approved: todaysRequests.filter((r) => r.status === 'APPROVED').length,
        pending: todaysRequests.filter((r) =>
          ['PENDING_EB', 'PENDING_PRESIDENT', 'PENDING_FACULTY'].includes(r.status)
        ).length,
        rejected: todaysRequests.filter((r) => r.status === 'REJECTED').length,
      },
      overdueStudents: overdueStudents.map((req) => ({
        name: req.student.name,
        rollNo: req.student.rollNo,
        society: req.society.name,
        expectedReturn: req.returnTime,
        exitTime: req.verifiedAt?.toLocaleString(),
      })),
      overdueCount: overdueStudents.length,
      permissionsByDomain: {
        fest: todaysRequests.filter((r) => r.society.domain === 'FEST').length,
        society: todaysRequests.filter((r) => r.society.domain === 'SOCIETY').length,
      },
      weeklyTrends: weeklyData.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        count: d._count.id,
      })),
      societies: societies.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        memberCount: s._count.members,
        permissionCount: s._count.permissionRequests,
      })),
    };
  }

  /**
   * Get stats v2 with active/live split
   */
  async getStatsV2() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activePermissions = await prisma.permissionRequest.count({
      where: { status: 'APPROVED', date: { gte: today } },
    });

    const livePermissions = await prisma.permissionRequest.count({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
    });

    const lateReturns = await prisma.permissionRequest.count({
      where: { isLate: true, checkInAt: { gte: today } },
    });

    const pendingReEval = await prisma.notification.count({
      where: { type: 'RE_EVAL_REQUESTED', isRead: false },
    });

    return { activePermissions, livePermissions, lateReturns, pendingReEval };
  }

  /**
   * Flag a student (HARD flag by DOSA)
   */
  async flagStudent(studentId: string, reason: string, flaggedBy?: string) {
    const student = await prisma.user.update({
      where: { id: studentId },
      data: {
        isFlagged: true,
        flagType: 'HARD',
        flagReason: reason,
        flaggedBy: flaggedBy || 'DOSA',
        flaggedAt: new Date(),
      },
    });

    // Find student's society memberships to notify EBs
    const memberships = await prisma.membership.findMany({
      where: { userId: studentId, status: 'APPROVED' },
      include: { society: { include: { staff: true } } },
    });

    for (const membership of memberships) {
      const ebUsers = membership.society.staff.filter((s) => s.role === 'SOCIETY_EB');
      for (const eb of ebUsers) {
        await prisma.notification.create({
          data: {
            userId: eb.id,
            type: 'MEMBER_FLAGGED',
            title: 'Member Flagged by DOSA',
            message: `${student.name} (${student.rollNo}) has been flagged. Reason: ${reason}`,
            metadata: { studentId, studentName: student.name, flagType: 'HARD' },
          },
        });
      }
    }

    return { success: true, student };
  }

  /**
   * De-flag a student
   */
  async deflagStudent(studentId: string) {
    const student = await prisma.user.update({
      where: { id: studentId },
      data: {
        isFlagged: false,
        flagType: null,
        flagReason: null,
        flaggedBy: null,
        flaggedAt: null,
      },
    });

    return { success: true, student };
  }

  /**
   * Get permission lists by category
   */
  async getPermissionLists() {
    const societyPermissions = await prisma.permissionRequest.findMany({
      where: { society: { domain: 'SOCIETY' } },
      include: { student: true, society: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const festPermissions = await prisma.permissionRequest.findMany({
      where: { society: { domain: 'FEST' } },
      include: { student: true, society: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const academicPermissions = await prisma.academicPermission.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const allStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        rollNo: true,
        branch: true,
        year: true,
        isFlagged: true,
        flagType: true,
        flagReason: true,
      },
      orderBy: { name: 'asc' },
    });

    return { societyPermissions, festPermissions, academicPermissions, allStudents };
  }

  /**
   * Get pending re-evaluation requests
   */
  async getReEvalRequests() {
    return prisma.notification.findMany({
      where: { type: 'RE_EVAL_REQUESTED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve de-flag from re-evaluation request
   */
  async approveDeflagReeval(notificationId: string, studentId: string) {
    await prisma.user.update({
      where: { id: studentId },
      data: {
        isFlagged: false,
        flagType: null,
        flagReason: null,
        flaggedBy: null,
        flaggedAt: null,
      },
    });

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }

    return { success: true, message: 'Student de-flagged' };
  }

  /**
   * Get active permissions (all approved)
   */
  async getActivePermissions() {
    return prisma.permissionRequest.findMany({
      where: { status: 'APPROVED' },
      include: { student: true, society: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get live permissions (scanned out, not returned)
   */
  async getLivePermissions() {
    return prisma.permissionRequest.findMany({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
      include: { student: true, society: true },
      orderBy: { verifiedAt: 'desc' },
    });
  }

  /**
   * Create academic permission
   */
  async createAcademicPermission(data: {
    studentId?: string;
    studentName: string;
    rollNo: string;
    faculty: string;
    reason: string;
    date: string;
    department?: string;
    exitTime: string;
    returnTime?: string;
  }) {
    return prisma.academicPermission.create({
      data: {
        studentId: data.studentId || undefined,
        studentName: data.studentName,
        rollNo: data.rollNo,
        faculty: data.faculty,
        reason: data.reason,
        date: new Date(data.date),
        department: data.department,
        exitTime: data.exitTime,
        returnTime: data.returnTime,
        status: 'PENDING_FACULTY',
      },
    });
  }

  /**
   * Get all academic permissions
   */
  async getAcademicPermissions() {
    return prisma.academicPermission.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve academic permission (generates QR)
   */
  async approveAcademicPermission(permissionId: string) {
    const permission = await prisma.academicPermission.findUnique({
      where: { id: permissionId },
      include: { student: true },
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    const jwt = require('jsonwebtoken');
    const { appConfig } = require('../config/config');

    const qrToken = jwt.sign(
      {
        permissionId: permission.id,
        studentId: permission.studentId,
        type: 'ACADEMIC',
        date: permission.date.toISOString(),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      appConfig.jwtSecret
    );

    const expiresAt = new Date(permission.date);
    expiresAt.setHours(26, 0, 0, 0);

    await prisma.academicPermission.update({
      where: { id: permissionId },
      data: {
        status: 'APPROVED',
        qrToken,
        qrGeneratedAt: new Date(),
        expiresAt,
      },
    });

    return { success: true, qrToken };
  }
}

export const adminService = new AdminService();
