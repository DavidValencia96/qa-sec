import { Router } from 'express';
import { listAllUsers, modifyUserAccess } from '../controllers/auth/adminUsers.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { fetchAuditLogs } from '../services/auditLog.service.js';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(['ADMIN']));

router.get('/users', listAllUsers);
router.patch('/users/:userId', modifyUserAccess);

router.get('/audit-logs', async (_req, res) => {
  try {
    const logs = await fetchAuditLogs(50);
    res.json({ success: true, logs });
  } catch {
    res.status(500).json({ success: false, error: 'Error al recuperar logs de auditoría' });
  }
});

export default router;