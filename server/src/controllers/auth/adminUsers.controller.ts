import { Response } from 'express';
import { fetchAllUsers, updateUserRoleAndStatus } from '../../services/auth/admin.repository.js';
import type { AuthenticatedRequest, UserRole } from '../../modules/auth/auth.types.js';
import { SYSTEM_MODULES, SystemModuleKey } from '../../modules/auth/auth.constants.js';
import { logAuditEvent } from '../../services/auditLog.service.js';

const sanitizeModules = (modules: unknown): SystemModuleKey[] => {
  if (!Array.isArray(modules)) return [];
  return modules.filter((m): m is SystemModuleKey => SYSTEM_MODULES.includes(m as SystemModuleKey));
};

export const listAllUsers = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await fetchAllUsers();
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const modifyUserAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { role, allowedModules, isActive }: { role: UserRole; allowedModules?: unknown; isActive: boolean } = req.body;

  try {
    const safeModules = sanitizeModules(allowedModules);
    await updateUserRoleAndStatus(userId, role, safeModules, isActive);

    const adminUser = req.user;
    await logAuditEvent({
      userId: adminUser?.userId || null,
      userEmail: adminUser?.email || 'admin@qa-sec.local',
      action: !isActive ? 'USER_SUSPEND' : 'ROLE_CHANGE',
      module: 'ADMIN_RBAC',
      details: `Modificó usuario (${userId}): Rol=${role}, Módulos=[${safeModules.join(', ')}], Activo=${isActive}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Permisos actualizados con éxito.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};