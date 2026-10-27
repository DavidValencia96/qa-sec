import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserRole } from '../modules/auth/auth.types.js';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'No autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Permisos insuficientes.' });
      return;
    }

    next();
  };
};