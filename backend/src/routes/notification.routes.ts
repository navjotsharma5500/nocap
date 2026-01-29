import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

router.get('/:userId', (req, res) => notificationController.getByUser(req, res));
router.post('/mark-read', (req, res) => notificationController.markAsRead(req, res));

export default router;
