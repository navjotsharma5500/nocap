import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const notifications = await notificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.body;
      const result = await notificationService.markAsRead(notificationId);
      res.json(result);
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
}

export const notificationController = new NotificationController();
