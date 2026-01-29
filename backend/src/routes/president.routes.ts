import { Router } from 'express';
import { presidentController } from '../controllers/president.controller';

const router = Router();

router.get('/pending-bulk-requests/:societyId', (req, res) => presidentController.getPendingBulkRequests(req, res));
router.post('/approve-bulk-request', (req, res) => presidentController.approveBulkRequest(req, res));

export default router;
