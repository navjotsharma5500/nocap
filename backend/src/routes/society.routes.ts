import { Router } from 'express';
import { societyController } from '../controllers/society.controller';

const router = Router();

router.get('/', (req, res) => societyController.getAll(req, res));
router.post('/join', (req, res) => societyController.join(req, res));
router.post('/join-by-code', (req, res) => societyController.joinByCode(req, res));

export default router;
