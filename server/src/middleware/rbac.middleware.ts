import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserRole } from '../modules/auth/auth.types.js';
import type { SystemModuleKey } from '../modules/auth/auth.constants.js';

export const requireRole = (allowedRoles: readonly UserRole[]) => {
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

export const requireModuleAccess = (requiredModule: SystemModuleKey) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Sesión no autenticada.' });
      return;
    }

    // ADMIN y AUDITOR cuentan con autorización global sin validar checklist individual
    if (user.role === 'ADMIN' || user.role === 'AUDITOR') {
      return next();
    }

    // Para VIEWER u otros roles se comprueba el listado granular asignado en BD
    const authorized = user.allowed_modules || [];
    if (!authorized.includes(requiredModule)) {
      res.status(403).json({
        success: false,
        error: `Acceso denegado: carece de permisos para el módulo [${requiredModule}].`,
      });
      return;
    }

    next();
  };
};