import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/config';
import { AuthRequest, JwtPayload } from '../types';

/**
 * JWT Authentication Middleware - Required
 * Rejects requests without valid token
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, appConfig.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional Auth Middleware
 * Doesn't reject if no token, just doesn't set user
 * Also supports legacy x-user-id header for backwards compatibility
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, appConfig.jwtSecret) as JwtPayload;
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  // Also support legacy x-user-id header for backwards compatibility
  if (!req.user && req.headers['x-user-id']) {
    req.user = { userId: req.headers['x-user-id'] as string } as any;
  }

  next();
};
