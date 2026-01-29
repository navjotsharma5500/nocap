import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/change-password', authMiddleware, (req, res) => authController.changePassword(req as any, res));
router.get('/me', authMiddleware, (req, res) => authController.me(req as any, res));

export default router;
