import { Request, Response } from 'express';
import { permissionService } from '../services/permission.service';

export class PermissionController {
  async create(req: Request, res: Response) {
    try {
      const { studentId, societyId, reason, date, exitTime, returnTime } = req.body;

      if (!studentId || !societyId || !reason || !date || !exitTime) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['studentId', 'societyId', 'reason', 'date', 'exitTime'],
        });
      }

      const request = await permissionService.createPermission({
        studentId,
        societyId,
        reason,
        date,
        exitTime,
        returnTime,
      });
      res.json(request);
    } catch (error) {
      console.error('Permission create error:', error);
      res.status(400).json({ error: 'Request failed' });
    }
  }

  async getByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const requests = await permissionService.getStudentPermissions(studentId);
      res.json(requests);
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({ error: 'Failed to get permissions' });
    }
  }

  async getActivePass(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const result = await permissionService.getActivePass(studentId);
      res.json(result);
    } catch (error) {
      console.error('Get active pass error:', error);
      res.status(500).json({ error: 'Failed to get active pass' });
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const { permissionId, studentId } = req.body;
      const result = await permissionService.activatePermission(permissionId, studentId);
      res.json(result);
    } catch (error: any) {
      console.error('Activate permission error:', error);
      res.status(400).json({ error: error.message || 'Failed to activate permission' });
    }
  }
}

export const permissionController = new PermissionController();
