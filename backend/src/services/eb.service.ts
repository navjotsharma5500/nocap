import { prisma } from '../lib/prisma';

export class EbService {
  /**
   * Get pending members for a society
   */
  async getPendingMembers(societyId: string) {
    return prisma.membership.findMany({
      where: { societyId, status: 'PENDING' },
      include: { user: true },
    });
  }

  /**
   * Approve/reject member
   */
  async approveMember(membershipId: string, status: 'APPROVED' | 'REJECTED') {
    return prisma.membership.update({
      where: { id: membershipId },
      data: { status },
    });
  }

  /**
   * Soft flag a member
   */
  async softFlagMember(studentId: string, reason: string, flaggedBy?: string) {
    return prisma.user.update({
      where: { id: studentId },
      data: {
        isFlagged: true,
        flagType: 'SOFT',
        flagReason: reason,
        flaggedBy: flaggedBy || 'Society EB',
        flaggedAt: new Date(),
      },
    });
  }

  /**
   * Request re-evaluation for flagged member
   */
  async requestReEvaluation(studentId: string, reason: string, requestedBy: string, societyId?: string) {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new Error('Student not found');
    }

    const admins = await prisma.user.findMany({ where: { role: 'FACULTY_ADMIN' } });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'RE_EVAL_REQUESTED',
          title: 'Re-evaluation Request',
          message: `EB requests re-evaluation for ${student.name} (${student.rollNo}). Reason: ${reason}`,
          metadata: { studentId, studentName: student.name, requestedBy, societyId },
        },
      });
    }

    return { success: true, message: 'Re-evaluation request sent to DOSA' };
  }

  /**
   * Get flagged members for a society
   */
  async getFlaggedMembers(societyId: string) {
    const memberships = await prisma.membership.findMany({
      where: { societyId, status: 'APPROVED' },
      include: { user: true },
    });

    return memberships
      .filter((m) => m.user.isFlagged)
      .map((m) => ({
        id: m.user.id,
        name: m.user.name,
        rollNo: m.user.rollNo,
        flagType: m.user.flagType,
        flagReason: m.user.flagReason,
        flaggedBy: m.user.flaggedBy,
        flaggedAt: m.user.flaggedAt,
      }));
  }

  /**
   * Get society stats for EB dashboard
   */
  async getSocietyStats(societyId: string) {
    const totalMembers = await prisma.membership.count({
      where: { societyId, status: 'APPROVED' },
    });

    const memberships = await prisma.membership.findMany({
      where: { societyId, status: 'APPROVED' },
      include: { user: true },
    });
    const flaggedMembers = memberships.filter((m) => m.user.isFlagged).length;

    const membersOut = await prisma.permissionRequest.count({
      where: {
        societyId,
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
    });

    return { totalMembers, flaggedMembers, membersOut };
  }

  /**
   * Get approved members for a society (for bulk selection)
   */
  async getApprovedMembers(societyId: string) {
    const memberships = await prisma.membership.findMany({
      where: { societyId, status: 'APPROVED' },
      include: { user: true },
    });

    return memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      rollNo: m.user.rollNo,
      branch: m.user.branch,
      isFlagged: m.user.isFlagged,
      flagType: m.user.flagType,
    }));
  }

  /**
   * Get pending activations for a society
   */
  async getPendingActivations(societyId: string) {
    return prisma.permissionRequest.findMany({
      where: {
        societyId,
        activationStatus: 'PENDING_EB_ACTIVATION',
      },
      include: { student: true, society: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve/reject activation
   */
  async approveActivation(permissionId: string, action: 'approve' | 'reject') {
    if (action === 'approve') {
      await prisma.permissionRequest.update({
        where: { id: permissionId },
        data: {
          isActivated: true,
          activatedAt: new Date(),
          activationStatus: 'ACTIVATED',
          verifiedAt: new Date(),
        },
      });
    } else {
      await prisma.permissionRequest.update({
        where: { id: permissionId },
        data: { activationStatus: 'REJECTED' },
      });
    }
    return { success: true };
  }
}

export const ebService = new EbService();
