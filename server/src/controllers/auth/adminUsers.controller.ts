import { Response } from 'express';
import { fetchAllUsers, updateUserRoleAndStatus } from '../../services/auth/admin.repository.js';
import type { AuthenticatedRequest, UserRole } from '../../modules/auth/auth.types.js';
import { logAuditEvent } from '../../services/auditLog.service.js';

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
  const { role, isActive }: { role: UserRole; isActive: boolean } = req.body;

  try {
    await updateUserRoleAndStatus(userId, role, isActive);

    const adminUser = req.user as { id?: string; email?: string } | undefined;
    await logAuditEvent({
      userId: adminUser?.id || null,
      userEmail: adminUser?.email || 'admin@qa-sec.local',
      action: !isActive ? 'USER_SUSPEND' : 'ROLE_CHANGE',
      module: 'ADMIN_RBAC',
      details: `Actualizó usuario (${userId}): Rol=${role}, Estado=${isActive ? 'Activo' : 'Suspendido'}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Permisos actualizados con éxito.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};