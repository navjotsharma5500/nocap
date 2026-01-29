import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, rollNo, year, branch, hostel, gender, role } = req.body;

      if (!name || !email || !password || !rollNo || !hostel || !gender) {
        return res.status(400).json({
          error: 'All fields are required: name, email, password, rollNo, hostel, gender',
        });
      }

      const user = await authService.register({
        name,
        email,
        password,
        rollNo,
        year,
        branch,
        hostel,
        gender,
        role,
      });

      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      res.json(result);
    } catch (error: any) {
      console.error('Change password error:', error);
      const status = error.message === 'Current password is incorrect' ? 401 : 400;
      res.status(status).json({ error: error.message || 'Failed to change password' });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      res.json(user);
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(404).json({ error: error.message || 'Failed to get user' });
    }
  }
}

export const authController = new AuthController();
