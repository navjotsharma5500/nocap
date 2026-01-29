import { Request, Response } from 'express';
import { ebService } from '../services/eb.service';
import { bulkService } from '../services/bulk.service';

export class EbController {
  async getPendingMembers(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const members = await ebService.getPendingMembers(societyId);
      res.json(members);
    } catch (error) {
      console.error('Get pending members error:', error);
      res.status(500).json({ error: 'Failed to get pending members' });
    }
  }

  async approveMember(req: Request, res: Response) {
    try {
      const { membershipId, status } = req.body;
      const updated = await ebService.approveMember(membershipId, status);
      res.json(updated);
    } catch (error) {
      console.error('Approve member error:', error);
      res.status(500).json({ error: 'Failed to approve member' });
    }
  }

  async softFlagMember(req: Request, res: Response) {
    try {
      const { studentId, reason, flaggedBy } = req.body;
      const student = await ebService.softFlagMember(studentId, reason, flaggedBy);
      res.json({ success: true, student });
    } catch (error) {
      console.error('Soft flag error:', error);
      res.status(500).json({ error: 'Failed to flag member' });
    }
  }

  async requestReEvaluation(req: Request, res: Response) {
    try {
      const { studentId, reason, requestedBy, societyId } = req.body;
      const result = await ebService.requestReEvaluation(studentId, reason, requestedBy, societyId);
      res.json(result);
    } catch (error: any) {
      console.error('Re-evaluation request error:', error);
      res.status(500).json({ error: error.message || 'Failed to request re-evaluation' });
    }
  }

  async getFlaggedMembers(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const members = await ebService.getFlaggedMembers(societyId);
      res.json(members);
    } catch (error) {
      console.error('Get flagged members error:', error);
      res.status(500).json({ error: 'Failed to get flagged members' });
    }
  }

  async getSocietyStats(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const stats = await ebService.getSocietyStats(societyId);
      res.json(stats);
    } catch (error) {
      console.error('EB stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }

  async getApprovedMembers(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const members = await ebService.getApprovedMembers(societyId);
      res.json(members);
    } catch (error) {
      console.error('Get approved members error:', error);
      res.status(500).json({ error: 'Failed to get members' });
    }
  }

  async createBulkRequest(req: Request, res: Response) {
    try {
      const { societyId, createdBy, reason, date, exitTime, returnTime, documentUrl, studentIds } = req.body;

      if (!societyId || !reason || !date || !exitTime || !studentIds || studentIds.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await bulkService.createBulkRequest({
        societyId,
        createdBy,
        reason,
        date,
        exitTime,
        returnTime,
        documentUrl,
        studentIds,
      });
      res.json(result);
    } catch (error) {
      console.error('Create bulk request error:', error);
      res.status(500).json({ error: 'Failed to create bulk request' });
    }
  }

  async createBulkRequestV2(req: Request, res: Response) {
    try {
      const { societyId, createdBy, reason, startDate, endDate, exitTime, returnTime, documentUrl, studentIds } =
        req.body;

      if (!societyId || !reason || !startDate || !exitTime || !studentIds || studentIds.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await bulkService.createBulkRequestV2({
        societyId,
        createdBy,
        reason,
        startDate,
        endDate,
        exitTime,
        returnTime,
        documentUrl,
        studentIds,
      });
      res.json(result);
    } catch (error) {
      console.error('Create bulk request v2 error:', error);
      res.status(500).json({ error: 'Failed to create bulk request' });
    }
  }

  async getPendingActivations(req: Request, res: Response) {
    try {
      const { societyId } = req.params;
      const activations = await ebService.getPendingActivations(societyId);
      res.json(activations);
    } catch (error) {
      console.error('Get pending activations error:', error);
      res.status(500).json({ error: 'Failed to get pending activations' });
    }
  }

  async approveActivation(req: Request, res: Response) {
    try {
      const { permissionId, action } = req.body;
      const result = await ebService.approveActivation(permissionId, action);
      res.json(result);
    } catch (error) {
      console.error('Approve activation error:', error);
      res.status(500).json({ error: 'Failed to process activation' });
    }
  }
}

export const ebController = new EbController();
