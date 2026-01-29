import { prisma } from '../lib/prisma';

export class NotificationService {
  /**
   * Get notifications for user
   */
  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true };
  }

  /**
   * Create a notification
   */
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
      },
    });
  }
}

export const notificationService = new NotificationService();
