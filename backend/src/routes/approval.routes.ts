import { Router } from 'express';
import { approvalController } from '../controllers/approval.controller';

const router = Router();

router.get('/eb/:societyId', (req, res) => approvalController.getEbPending(req, res));
router.get('/president/:societyId', (req, res) => approvalController.getPresidentPending(req, res));
router.get('/faculty', (req, res) => approvalController.getFacultyPending(req, res));
router.post('/update', (req, res) => approvalController.update(req, res));
router.post('/faculty/approve', (req, res) => approvalController.facultyApprove(req, res));

export default router;
