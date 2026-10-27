import { Router } from 'express';
import { listAllUsers, modifyUserAccess } from '../controllers/auth/adminUsers.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateJwt);
router.use(requireRole(['ADMIN']));

router.get('/users', listAllUsers);
router.patch('/users/:userId', modifyUserAccess);

export default router;