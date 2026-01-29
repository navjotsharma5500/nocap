import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { appConfig } from '../config/config';

export class GuardService {
  /**
   * Verify QR code (simple single scan)
   */
  async verifyQr(qrToken: string, guardId?: string) {
    if (!qrToken) {
      return { success: false, message: 'No QR token provided' };
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(qrToken, appConfig.jwtSecret);
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return { success: false, message: 'QR token expired' };
      }
      return { success: false, message: 'Invalid QR token' };
    }

    // Get permission request
    const request = await prisma.permissionRequest.findUnique({
      where: { id: decoded.requestId || decoded.permissionId },
      include: {
        student: true,
        society: true,
      },
    });

    if (!request) {
      return { success: false, message: 'Pass not found in system' };
    }

    // Check expiry
    if (request.expiresAt && new Date() > request.expiresAt) {
      return { success: false, message: 'Pass expired' };
    }

    // Check status
    if (request.status !== 'APPROVED') {
      return { success: false, message: 'Pass not approved' };
    }

    // Mark as verified (optional - for audit trail)
    if (!request.verifiedAt) {
      await prisma.permissionRequest.update({
        where: { id: request.id },
        data: {
          verifiedAt: new Date(),
          verifiedBy: guardId || 'guard-unknown',
        },
      });
    }

    return {
      success: true,
      message: '✓ STUDENT APPROVED TO LEAVE',
      student: {
        name: request.student.name,
        rollNo: request.student.rollNo,
        hostel: request.student.branch ? `${request.student.branch}-Block` : 'Unknown',
        reason: request.reason,
        exitTime: request.exitTime,
        returnTime: request.returnTime || 'Not specified',
        validUntil: request.expiresAt?.toLocaleString() || 'N/A',
        society: request.society.name,
        verifiedAt: request.verifiedAt?.toLocaleString() || 'Just now',
      },
    };
  }

  /**
   * Check-in (return verification)
   */
  async checkIn(qrToken: string, guardId?: string) {
    if (!qrToken) {
      return { success: false, message: 'No QR token provided' };
    }

    let decoded: any;
    try {
      decoded = jwt.verify(qrToken, appConfig.jwtSecret);
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return { success: false, message: 'QR token expired' };
      }
      return { success: false, message: 'Invalid QR token' };
    }

    const request = await prisma.permissionRequest.findUnique({
      where: { id: decoded.requestId || decoded.permissionId },
      include: {
        student: true,
        society: true,
      },
    });

    if (!request) {
      return { success: false, message: 'Pass not found in system' };
    }

    // Check if already checked in
    if (request.checkInAt) {
      return {
        success: false,
        message: 'Student already returned',
        student: {
          name: request.student.name,
          rollNo: request.student.rollNo,
          checkInAt: request.checkInAt.toLocaleString(),
        },
      };
    }

    // Check if was verified (exited)
    if (!request.verifiedAt) {
      return {
        success: false,
        message: 'Student has not exited yet - cannot check in',
      };
    }

    // Mark as checked in
    await prisma.permissionRequest.update({
      where: { id: request.id },
      data: {
        checkInAt: new Date(),
        checkInBy: guardId || 'guard-unknown',
      },
    });

    // Calculate time out
    const timeOut = request.verifiedAt
      ? Math.round((Date.now() - request.verifiedAt.getTime()) / (1000 * 60))
      : 0;

    return {
      success: true,
      message: '✓ STUDENT RETURNED SAFELY',
      student: {
        name: request.student.name,
        rollNo: request.student.rollNo,
        hostel: request.student.branch ? `${request.student.branch}-Block` : 'Unknown',
        society: request.society.name,
        exitTime: request.verifiedAt?.toLocaleString() || 'Unknown',
        returnTime: new Date().toLocaleString(),
        timeOutMinutes: timeOut,
      },
    };
  }

  /**
   * Get guard stats for today
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exits = await prisma.permissionRequest.count({
      where: { verifiedAt: { gte: today } },
    });

    const returns = await prisma.permissionRequest.count({
      where: { checkInAt: { gte: today } },
    });

    const currentlyOut = await prisma.permissionRequest.count({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
    });

    return { todayExits: exits, todayReturns: returns, currentlyOut };
  }

  /**
   * Verify QR with full status (v2)
   */
  async verifyQrV2(qrToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(qrToken, appConfig.jwtSecret);
    } catch (err) {
      return { valid: false, error: 'Invalid or expired QR code' };
    }

    const permission = await prisma.permissionRequest.findUnique({
      where: { id: decoded.permissionId || decoded.requestId },
      include: { student: true, society: true },
    });

    if (!permission) {
      return { valid: false, error: 'Permission not found' };
    }

    const now = new Date();
    let status = 'UNKNOWN';
    let canExit = false;
    let canCheckIn = false;

    if (permission.status !== 'APPROVED') {
      status = 'NOT_APPROVED';
    } else if (permission.checkInAt) {
      status = 'COMPLETED';
    } else if (permission.verifiedAt) {
      status = 'ACTIVE_OUT';
      canCheckIn = true;
    } else if (permission.expiresAt && now > permission.expiresAt) {
      status = 'EXPIRED';
    } else {
      status = 'ACTIVE_READY';
      canExit = true;
    }

    return {
      valid: status === 'ACTIVE_READY' || status === 'ACTIVE_OUT',
      status,
      canExit,
      canCheckIn,
      student: {
        id: permission.student.id,
        name: permission.student.name,
        rollNo: permission.student.rollNo,
        branch: permission.student.branch,
        isFlagged: permission.student.isFlagged,
      },
      society: permission.society.name,
      reason: permission.reason,
      date: permission.date,
      startDate: permission.startDate,
      endDate: permission.endDate,
      exitTime: permission.exitTime,
      returnTime: permission.returnTime,
      verifiedAt: permission.verifiedAt,
      expiresAt: permission.expiresAt,
    };
  }

  /**
   * Check-in with late detection (v2)
   */
  async checkInV2(qrToken: string, guardId?: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(qrToken, appConfig.jwtSecret);
    } catch (err) {
      throw new Error('Invalid or expired QR code');
    }

    const permission = await prisma.permissionRequest.findUnique({
      where: { id: decoded.permissionId || decoded.requestId },
      include: { student: true, society: true },
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    if (permission.checkInAt) {
      throw new Error('Already checked in');
    }

    if (!permission.verifiedAt) {
      throw new Error('Permission not activated - student has not exited');
    }

    // Calculate if late
    const now = new Date();
    let isLate = false;
    let lateMinutes = 0;

    if (permission.returnTime) {
      const [hours, minutes] = permission.returnTime.split(':').map(Number);
      const expectedReturn = new Date(permission.date);
      expectedReturn.setHours(hours, minutes, 0, 0);

      if (expectedReturn < permission.verifiedAt) {
        expectedReturn.setDate(expectedReturn.getDate() + 1);
      }

      if (now > expectedReturn) {
        isLate = true;
        lateMinutes = Math.floor((now.getTime() - expectedReturn.getTime()) / (1000 * 60));
      }
    }

    // Update permission with check-in
    await prisma.permissionRequest.update({
      where: { id: permission.id },
      data: {
        checkInAt: now,
        checkInBy: guardId,
        isLate,
        lateMinutes: isLate ? lateMinutes : null,
      },
    });

    // If late, create notifications
    if (isLate) {
      const ebUsers = await prisma.user.findMany({
        where: { societyId: permission.societyId, role: 'SOCIETY_EB' },
      });

      for (const eb of ebUsers) {
        await prisma.notification.create({
          data: {
            userId: eb.id,
            type: 'LATE_RETURN',
            title: 'Late Return Alert',
            message: `${permission.student.name} returned ${lateMinutes} minutes late.`,
            metadata: {
              studentId: permission.studentId,
              permissionId: permission.id,
              lateMinutes,
            },
          },
        });
      }

      // If more than 1 hour late, notify admin too
      if (lateMinutes > 60) {
        const admins = await prisma.user.findMany({
          where: { role: 'FACULTY_ADMIN' },
        });

        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'SEVERELY_LATE_RETURN',
              title: 'Severely Late Return - Action Required',
              message: `${permission.student.name} returned ${Math.floor(lateMinutes / 60)}h ${lateMinutes % 60}m late!`,
              metadata: {
                studentId: permission.studentId,
                permissionId: permission.id,
                lateMinutes,
              },
            },
          });
        }
      }
    }

    return {
      success: true,
      student: {
        name: permission.student.name,
        rollNo: permission.student.rollNo,
      },
      society: permission.society.name,
      exitTime: permission.verifiedAt,
      returnTime: permission.returnTime,
      checkInTime: now,
      isLate,
      lateMinutes: isLate ? lateMinutes : 0,
    };
  }

  /**
   * Get permission by request ID
   */
  async getPermissionById(requestId: string) {
    return prisma.permissionRequest.findUnique({
      where: { id: requestId },
      include: { student: true },
    });
  }
}

export const guardService = new GuardService();
