import { Router } from 'express';
import { ebController } from '../controllers/eb.controller';

const router = Router();

router.get('/pending-members/:societyId', (req, res) => ebController.getPendingMembers(req, res));
router.post('/approve-member', (req, res) => ebController.approveMember(req, res));
router.post('/soft-flag-member', (req, res) => ebController.softFlagMember(req, res));
router.post('/request-re-evaluation', (req, res) => ebController.requestReEvaluation(req, res));
router.get('/flagged-members/:societyId', (req, res) => ebController.getFlaggedMembers(req, res));
router.get('/society-stats/:societyId', (req, res) => ebController.getSocietyStats(req, res));
router.get('/approved-members/:societyId', (req, res) => ebController.getApprovedMembers(req, res));
router.post('/create-bulk-request', (req, res) => ebController.createBulkRequest(req, res));
router.post('/create-bulk-request-v2', (req, res) => ebController.createBulkRequestV2(req, res));
router.get('/pending-activations/:societyId', (req, res) => ebController.getPendingActivations(req, res));
router.post('/approve-activation', (req, res) => ebController.approveActivation(req, res));

export default router;
