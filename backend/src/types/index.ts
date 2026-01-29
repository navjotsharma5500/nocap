import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  societyId: string | null;
  societyName: string | null;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}
