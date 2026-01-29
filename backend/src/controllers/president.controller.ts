import { Request, Response } from 'express';
import { bulkService } from '../services/bulk.service';

export class PresidentController {
  async getPendingBulkRequests(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const requests = await bulkService.getPendingBulkRequests(societyId);
      res.json(requests);
    } catch (error) {
      console.error('Get bulk requests error:', error);
      res.status(500).json({ error: 'Failed to get bulk requests' });
    }
  }

  async approveBulkRequest(req: Request, res: Response) {
    try {
      const { bulkRequestId, action } = req.body;
      const result = await bulkService.approveBulkRequest(bulkRequestId, action);
      res.json(result);
    } catch (error) {
      console.error('Approve bulk request error:', error);
      res.status(500).json({ error: 'Failed to process bulk request' });
    }
  }
}

export const presidentController = new PresidentController();
