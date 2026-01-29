import { prisma } from '../lib/prisma';

export class BulkService {
  /**
   * Create bulk permission request
   */
  async createBulkRequest(data: {
    societyId: string;
    createdBy: string;
    reason: string;
    date: string;
    exitTime: string;
    returnTime?: string;
    documentUrl?: string;
    studentIds: string[];
  }) {
    const bulkRequest = await prisma.bulkRequest.create({
      data: {
        societyId: data.societyId,
        createdBy: data.createdBy,
        reason: data.reason,
        date: new Date(data.date),
        exitTime: data.exitTime,
        returnTime: data.returnTime,
        documentUrl: data.documentUrl,
        status: 'PENDING_PRESIDENT',
      },
    });

    for (const studentId of data.studentIds) {
      await prisma.permissionRequest.create({
        data: {
          studentId,
          societyId: data.societyId,
          reason: data.reason,
          date: new Date(data.date),
          exitTime: data.exitTime,
          returnTime: data.returnTime,
          status: 'PENDING_PRESIDENT',
          bulkRequestId: bulkRequest.id,
        },
      });
    }

    return { success: true, bulkRequest };
  }

  /**
   * Create bulk request with date range (v2)
   */
  async createBulkRequestV2(data: {
    societyId: string;
    createdBy: string;
    reason: string;
    startDate: string;
    endDate?: string;
    exitTime: string;
    returnTime?: string;
    documentUrl?: string;
    studentIds: string[];
  }) {
    const bulkRequest = await prisma.bulkRequest.create({
      data: {
        societyId: data.societyId,
        createdBy: data.createdBy,
        reason: data.reason,
        date: new Date(data.startDate),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : new Date(data.startDate),
        exitTime: data.exitTime,
        returnTime: data.returnTime,
        documentUrl: data.documentUrl,
        status: 'PENDING_PRESIDENT',
      },
    });

    for (const studentId of data.studentIds) {
      await prisma.permissionRequest.create({
        data: {
          studentId,
          societyId: data.societyId,
          reason: data.reason,
          date: new Date(data.startDate),
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : new Date(data.startDate),
          exitTime: data.exitTime,
          returnTime: data.returnTime,
          status: 'PENDING_PRESIDENT',
          bulkRequestId: bulkRequest.id,
        },
      });
    }

    return { success: true, bulkRequest };
  }

  /**
   * Get pending bulk requests for a society (President)
   */
  async getPendingBulkRequests(societyId: string) {
    return prisma.bulkRequest.findMany({
      where: { societyId, status: 'PENDING_PRESIDENT' },
      include: {
        society: true,
        permissionRequests: { include: { student: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve/reject bulk request (President)
   */
  async approveBulkRequest(bulkRequestId: string, action: 'approve' | 'reject') {
    const newStatus = action === 'approve' ? 'PENDING_FACULTY' : 'REJECTED';

    await prisma.bulkRequest.update({
      where: { id: bulkRequestId },
      data: { status: newStatus as any },
    });

    await prisma.permissionRequest.updateMany({
      where: { bulkRequestId },
      data: { status: newStatus as any },
    });

    return { success: true };
  }
}

export const bulkService = new BulkService();
