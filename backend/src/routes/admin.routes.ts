import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';

const router = Router();

router.get('/students-out', (req, res) => adminController.getStudentsOut(req, res));
router.get('/stats', (req, res) => adminController.getStats(req, res));
router.get('/stats-v2', (req, res) => adminController.getStatsV2(req, res));
router.post('/flag-student', (req, res) => adminController.flagStudent(req, res));
router.post('/deflag-student', (req, res) => adminController.deflagStudent(req, res));
router.get('/permission-lists', (req, res) => adminController.getPermissionLists(req, res));
router.get('/re-eval-requests', (req, res) => adminController.getReEvalRequests(req, res));
router.post('/approve-deflag-reeval', (req, res) => adminController.approveDeflagReeval(req, res));
router.get('/active-permissions', (req, res) => adminController.getActivePermissions(req, res));
router.get('/live-permissions', (req, res) => adminController.getLivePermissions(req, res));
router.post('/academic-permissions', (req, res) => adminController.createAcademicPermission(req, res));
router.get('/academic-permissions', (req, res) => adminController.getAcademicPermissions(req, res));
router.post('/academic-permissions/approve', (req, res) => adminController.approveAcademicPermission(req, res));

export default router;
