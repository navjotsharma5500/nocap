import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { appConfig } from '../config/config';

export class PermissionService {
  /**
   * Create a permission request
   */
  async createPermission(data: {
    studentId: string;
    societyId: string;
    reason: string;
    date: string;
    exitTime: string;
    returnTime?: string;
  }) {
    return prisma.permissionRequest.create({
      data: {
        studentId: data.studentId,
        societyId: data.societyId,
        reason: data.reason,
        date: new Date(data.date),
        exitTime: data.exitTime,
        returnTime: data.returnTime || data.exitTime,
        status: 'PENDING_EB',
      },
    });
  }

  /**
   * Get student's permission requests
   */
  async getStudentPermissions(studentId: string) {
    return prisma.permissionRequest.findMany({
      where: { studentId },
      include: { society: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get student's active pass (approved, not verified, not expired)
   */
  async getActivePass(studentId: string) {
    const activePass = await prisma.permissionRequest.findFirst({
      where: {
        studentId,
        status: 'APPROVED',
        qrToken: { not: null },
        verifiedAt: null,
        expiresAt: { gte: new Date() },
      },
      include: {
        student: true,
        society: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activePass) {
      return { hasActivePass: false };
    }

    return {
      hasActivePass: true,
      pass: {
        id: activePass.id,
        qrToken: activePass.qrToken,
        studentName: activePass.student.name,
        rollNo: activePass.student.rollNo,
        hostel: activePass.student.branch ? `${activePass.student.branch}-Block` : 'Unknown',
        reason: activePass.reason,
        exitTime: activePass.exitTime,
        validUntil: activePass.expiresAt?.toLocaleString() || 'N/A',
        society: activePass.society.name,
      },
    };
  }

  /**
   * Activate a permission (student self-activation at hostel kiosk)
   */
  async activatePermission(permissionId: string, studentId: string) {
    const permission = await prisma.permissionRequest.findUnique({
      where: { id: permissionId },
    });

    if (!permission || permission.studentId !== studentId) {
      throw new Error('Permission not found');
    }

    if (permission.status !== 'APPROVED') {
      throw new Error('Permission is not approved');
    }

    if (permission.checkInAt) {
      throw new Error('Permission already used for today');
    }

    // Toggle: If verified (exited), then Check-in (De-live)
    if (permission.verifiedAt) {
      await prisma.permissionRequest.update({
        where: { id: permissionId },
        data: {
          checkInAt: new Date(),
          checkInBy: 'HOSTEL_KIOSK',
        },
      });
      return { success: true, message: 'Welcome back! You are checked in.' };
    }

    // Instant Activation (Hostel Desk QR)
    await prisma.permissionRequest.update({
      where: { id: permissionId },
      data: {
        isActivated: true,
        activationStatus: 'ACTIVATED',
        activatedAt: new Date(),
        verifiedAt: new Date(),
        verifiedBy: 'HOSTEL_KIOSK',
      },
    });

    return { success: true, message: 'Permission Activated & Verified. You may leave.' };
  }
}

export const permissionService = new PermissionService();
