import { Router } from 'express';
import { societyController } from '../controllers/society.controller';
import { permissionController } from '../controllers/permission.controller';

const router = Router();

router.get('/:studentId/memberships', (req, res) => societyController.getStudentMemberships(req, res));
router.get('/:studentId/active-pass', (req, res) => permissionController.getActivePass(req, res));
router.post('/activate-permission', (req, res) => permissionController.activate(req, res));

export default router;
