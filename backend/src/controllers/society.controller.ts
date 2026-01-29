import { Request, Response } from 'express';
import { societyService } from '../services/society.service';

export class SocietyController {
  async getAll(req: Request, res: Response) {
    try {
      const societies = await societyService.getAllSocieties();
      res.json(societies);
    } catch (error) {
      console.error('Get societies error:', error);
      res.status(500).json({ error: 'Failed to get societies' });
    }
  }

  async getStudentMemberships(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const result = await societyService.getStudentMemberships(studentId);
      res.json(result);
    } catch (error) {
      console.error('Get memberships error:', error);
      res.status(500).json({ error: 'Failed to get memberships' });
    }
  }

  async join(req: Request, res: Response) {
    try {
      const { userId, societyId, proofUrl } = req.body;
      const membership = await societyService.joinSociety(userId, societyId, proofUrl);
      res.json(membership);
    } catch (error) {
      console.error('Join society error:', error);
      res.status(400).json({ error: 'Join request failed' });
    }
  }

  async joinByCode(req: Request, res: Response) {
    try {
      const { userId, joinCode } = req.body;

      if (!userId || !joinCode) {
        return res.status(400).json({ error: 'userId and joinCode are required' });
      }

      const result = await societyService.joinByCode(userId, joinCode);
      res.json(result);
    } catch (error: any) {
      console.error('Join by code error:', error);
      res.status(400).json({ error: error.message || 'Join request failed' });
    }
  }
}

export const societyController = new SocietyController();
