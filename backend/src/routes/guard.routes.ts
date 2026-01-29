import { Router } from 'express';
import { guardController } from '../controllers/guard.controller';

const router = Router();

router.post('/verify-qr', (req, res) => guardController.verifyQr(req, res));
router.post('/check-in', (req, res) => guardController.checkIn(req, res));
router.get('/stats', (req, res) => guardController.getStats(req, res));
router.get('/verify/:requestId', (req, res) => guardController.getById(req, res));
router.post('/verify-qr-v2', (req, res) => guardController.verifyQrV2(req, res));
router.post('/check-in-v2', (req, res) => guardController.checkInV2(req, res));

export default router;
