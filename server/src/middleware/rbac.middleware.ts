import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserRole } from '../modules/auth/auth.types.js';
import type { SystemModuleKey } from '../modules/auth/auth.constants.js';
import { getDbPool } from '../config/database.js';

/**
 * Middleware para validar jerarquía estricta de Roles (RBAC)
 */
export const requireRole = (allowedRoles: readonly UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Acceso no autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Permisos insuficientes. Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para validar autorización granular por Módulo
 * ADMIN cuenta con acceso global.
 * AUDITOR y VIEWER deben tener el módulo presente en allowed_modules.
 */
export const requireModuleAccess = (requiredModule: SystemModuleKey) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Sesión no autenticada.' });
      return;
    }

    // Únicamente ADMIN posee bypass maestro de módulos
    if (user.role === 'ADMIN') {
      return next();
    }

    const authorized = Array.isArray(user.allowed_modules) ? user.allowed_modules : [];
    if (!authorized.includes(requiredModule)) {
      res.status(403).json({
        success: false,
        error: `Acceso denegado: carece de permisos asignados para el módulo de seguridad [${requiredModule}].`,
      });
      return;
    }

    next();
  };
};

/**
 * Trazabilidad inmutable: Registra eventos operacionales en audit_logs de forma asíncrona
 */
export const auditAction = (action: string, moduleName: string) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    // Continúa inmediatamente el ciclo de la petición para no agregar latencia
    next();

    // Inserción en segundo plano protegida contra fallos
    const userEmail = req.user?.email || 'visitante';
    const userId = req.user?.userId || null;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const details = JSON.stringify({
      path: req.originalUrl,
      method: req.method,
      target: req.body?.target_url || req.body?.target_host || req.body?.targetDomain || 'N/A',
      timestamp: new Date().toISOString(),
    });

    try {
      const pool = getDbPool();
      const query = `
        INSERT INTO audit_logs (user_id, user_email, action, module, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      pool.query(query, [userId, userEmail, action, moduleName, details, ipAddress]).catch((err) => {
        console.error('[AUDIT-LOG] Error silencioso al registrar auditoría:', err.message);
      });
    } catch {
      // Ignora para asegurar alta disponibilidad del flujo
    }
  };
};