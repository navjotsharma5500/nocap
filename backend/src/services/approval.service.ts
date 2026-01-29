import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { appConfig } from '../config/config';

export class ApprovalService {
  /**
   * Get EB pending requests for a society
   */
  async getEbPendingRequests(societyId: string) {
    return prisma.permissionRequest.findMany({
      where: { societyId, status: 'PENDING_EB' },
      include: { student: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get President pending requests for a society
   */
  async getPresidentPendingRequests(societyId: string) {
    return prisma.permissionRequest.findMany({
      where: { societyId, status: 'PENDING_PRESIDENT' },
      include: { student: true },
    });
  }

  /**
   * Get Faculty Admin pending requests
   */
  async getFacultyPendingRequests() {
    return prisma.permissionRequest.findMany({
      where: { status: 'PENDING_FACULTY' },
      include: { student: true, society: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Update request status
   */
  async updateRequestStatus(requestId: string, status: string, type: string = 'permission') {
    if (type === 'permission') {
      return prisma.permissionRequest.update({
        where: { id: requestId },
        data: { status: status as any },
      });
    }
    // Handle other types if needed
  }

  /**
   * Faculty approve and generate QR token
   */
  async facultyApprove(requestId: string) {
    const request = await prisma.permissionRequest.findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    // Generate secure JWT token for QR code
    const qrToken = jwt.sign(
      {
        requestId: request.id,
        permissionId: request.id,
        studentId: request.studentId,
        date: request.date.toISOString(),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      },
      appConfig.jwtSecret
    );

    // Calculate expiry (2:00 AM next day)
    const expiresAt = new Date(request.date);
    expiresAt.setHours(26, 0, 0, 0); // 2 AM next day

    // Update request with QR token
    const updated = await prisma.permissionRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        qrToken,
        qrGeneratedAt: new Date(),
        expiresAt,
      },
    });

    return {
      success: true,
      qrToken,
      request: updated,
      student: request.student,
    };
  }
}

export const approvalService = new ApprovalService();
