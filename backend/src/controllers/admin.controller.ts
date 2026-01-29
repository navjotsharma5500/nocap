import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

export class AdminController {
  async getStudentsOut(req: Request, res: Response) {
    try {
      const result = await adminService.getStudentsOut();
      res.json(result);
    } catch (error) {
      console.error('Get students out error:', error);
      res.status(500).json({ error: 'Failed to get students out' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }

  async getStatsV2(req: Request, res: Response) {
    try {
      const stats = await adminService.getStatsV2();
      res.json(stats);
    } catch (error) {
      console.error('Stats v2 error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }

  async flagStudent(req: Request, res: Response) {
    try {
      const { studentId, reason, flaggedBy } = req.body;

      if (!studentId || !reason) {
        return res.status(400).json({ error: 'studentId and reason are required' });
      }

      const result = await adminService.flagStudent(studentId, reason, flaggedBy);
      res.json(result);
    } catch (error) {
      console.error('Flag student error:', error);
      res.status(500).json({ error: 'Failed to flag student' });
    }
  }

  async deflagStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.body;
      const result = await adminService.deflagStudent(studentId);
      res.json(result);
    } catch (error) {
      console.error('Deflag student error:', error);
      res.status(500).json({ error: 'Failed to de-flag student' });
    }
  }

  async getPermissionLists(req: Request, res: Response) {
    try {
      const result = await adminService.getPermissionLists();
      res.json(result);
    } catch (error) {
      console.error('Permission lists error:', error);
      res.status(500).json({ error: 'Failed to get permission lists' });
    }
  }

  async getReEvalRequests(req: Request, res: Response) {
    try {
      const requests = await adminService.getReEvalRequests();
      res.json(requests);
    } catch (error) {
      console.error('Get re-eval requests error:', error);
      res.status(500).json({ error: 'Failed to get re-eval requests' });
    }
  }

  async approveDeflagReeval(req: Request, res: Response) {
    try {
      const { notificationId, studentId } = req.body;
      const result = await adminService.approveDeflagReeval(notificationId, studentId);
      res.json(result);
    } catch (error) {
      console.error('Approve deflag error:', error);
      res.status(500).json({ error: 'Failed to de-flag student' });
    }
  }

  async getActivePermissions(req: Request, res: Response) {
    try {
      const permissions = await adminService.getActivePermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Get active permissions error:', error);
      res.status(500).json({ error: 'Failed to get active permissions' });
    }
  }

  async getLivePermissions(req: Request, res: Response) {
    try {
      const permissions = await adminService.getLivePermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Get live permissions error:', error);
      res.status(500).json({ error: 'Failed to get live permissions' });
    }
  }

  async createAcademicPermission(req: Request, res: Response) {
    try {
      const permission = await adminService.createAcademicPermission(req.body);
      res.json(permission);
    } catch (error) {
      console.error('Create academic permission error:', error);
      res.status(500).json({ error: 'Failed to create academic permission' });
    }
  }

  async getAcademicPermissions(req: Request, res: Response) {
    try {
      const permissions = await adminService.getAcademicPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Get academic permissions error:', error);
      res.status(500).json({ error: 'Failed to get academic permissions' });
    }
  }

  async approveAcademicPermission(req: Request, res: Response) {
    try {
      const { permissionId } = req.body;
      const result = await adminService.approveAcademicPermission(permissionId);
      res.json(result);
    } catch (error: any) {
      console.error('Approve academic permission error:', error);
      res.status(500).json({ error: error.message || 'Failed to approve' });
    }
  }
}

export const adminController = new AdminController();
