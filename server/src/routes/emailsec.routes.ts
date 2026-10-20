import { Router } from 'express';
import { runEmailSecAuditHandler } from '../controllers/emailsec/emailsec.controller.js';

const router = Router();

router.post('/audit', runEmailSecAuditHandler);

export default router;