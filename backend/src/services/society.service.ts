import { prisma } from '../lib/prisma';

export class SocietyService {
  /**
   * Get all societies
   */
  async getAllSocieties() {
    return prisma.society.findMany();
  }

  /**
   * Get student's society memberships
   */
  async getStudentMemberships(studentId: string) {
    const memberships = await prisma.membership.findMany({
      where: { userId: studentId },
      include: { society: true },
      orderBy: { createdAt: 'desc' },
    });

    // Check if student has any approved membership
    const approvedMembership = memberships.find((m) => m.status === 'APPROVED');

    return {
      hasMembership: memberships.length > 0,
      hasApprovedMembership: !!approvedMembership,
      memberships,
      activeSociety: approvedMembership?.society || null,
    };
  }

  /**
   * Join society with proof
   */
  async joinSociety(userId: string, societyId: string, proofUrl?: string) {
    return prisma.membership.create({
      data: { userId, societyId, proofUrl, status: 'PENDING' },
    });
  }

  /**
   * Join society by code (auto-approve)
   */
  async joinByCode(userId: string, joinCode: string) {
    // Find society by join code
    const society = await prisma.society.findFirst({
      where: { joinCode: joinCode.toUpperCase() },
    });

    if (!society) {
      throw new Error('Invalid society code');
    }

    // Check if already a member
    const existing = await prisma.membership.findUnique({
      where: { userId_societyId: { userId, societyId: society.id } },
    });

    if (existing) {
      throw new Error('Already a member or pending approval');
    }

    // Auto-approve when joining with valid code
    const membership = await prisma.membership.create({
      data: {
        userId,
        societyId: society.id,
        status: 'PENDING',
      },
      include: { society: true },
    });

    return {
      success: true,
      message: `Successfully joined ${society.name}`,
      membership,
    };
  }
}

export const societyService = new SocietyService();
