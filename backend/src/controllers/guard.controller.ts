import { Request, Response } from 'express';
import { guardService } from '../services/guard.service';

export class GuardController {
  async verifyQr(req: Request, res: Response) {
    try {
      const { qrToken, guardId } = req.body;
      const result = await guardService.verifyQr(qrToken, guardId);
      res.json(result);
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ success: false, message: 'Verification failed' });
    }
  }

  async checkIn(req: Request, res: Response) {
    try {
      const { qrToken, guardId } = req.body;
      const result = await guardService.checkIn(qrToken, guardId);
      res.json(result);
    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({ success: false, message: 'Check-in failed' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await guardService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Guard stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const request = await guardService.getPermissionById(requestId);
      res.json(request);
    } catch (error) {
      console.error('Get permission error:', error);
      res.status(500).json({ error: 'Failed to get permission' });
    }
  }

  async verifyQrV2(req: Request, res: Response) {
    try {
      const { qrToken } = req.body;
      const result = await guardService.verifyQrV2(qrToken);
      
      if (!result.valid && result.error) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Verify QR v2 error:', error);
      res.status(500).json({ error: 'Failed to verify QR' });
    }
  }

  async checkInV2(req: Request, res: Response) {
    try {
      const { qrToken, guardId } = req.body;
      const result = await guardService.checkInV2(qrToken, guardId);
      res.json(result);
    } catch (error: any) {
      console.error('Check-in v2 error:', error);
      res.status(400).json({ error: error.message || 'Failed to check in' });
    }
  }
}

export const guardController = new GuardController();
