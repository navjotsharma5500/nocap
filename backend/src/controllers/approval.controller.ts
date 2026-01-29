import { Request, Response } from 'express';
import { approvalService } from '../services/approval.service';

export class ApprovalController {
  async getEbPending(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const requests = await approvalService.getEbPendingRequests(societyId);
      res.json(requests);
    } catch (error) {
      console.error('Get EB pending error:', error);
      res.status(500).json({ error: 'Failed to get requests' });
    }
  }

  async getPresidentPending(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const requests = await approvalService.getPresidentPendingRequests(societyId);
      res.json(requests);
    } catch (error) {
      console.error('Get President pending error:', error);
      res.status(500).json({ error: 'Failed to get requests' });
    }
  }

  async getFacultyPending(req: Request, res: Response) {
    try {
      const requests = await approvalService.getFacultyPendingRequests();
      res.json(requests);
    } catch (error) {
      console.error('Get Faculty pending error:', error);
      res.status(500).json({ error: 'Failed to get requests' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { requestId, status, type } = req.body;
      const updated = await approvalService.updateRequestStatus(requestId, status, type);
      res.json(updated);
    } catch (error) {
      console.error('Update approval error:', error);
      res.status(500).json({ error: 'Failed to update request' });
    }
  }

  async facultyApprove(req: Request, res: Response) {
    try {
      const { requestId } = req.body;
      const result = await approvalService.facultyApprove(requestId);
      res.json(result);
    } catch (error: any) {
      console.error('Faculty approve error:', error);
      res.status(500).json({ error: error.message || 'Failed to approve request' });
    }
  }
}

export const approvalController = new ApprovalController();
