import { Router } from 'express';
import { getComplianceRadarHandler, getComplianceTargetsHandler } from '../controllers/compliance/compliance.controller.js';

const router = Router();

router.get('/targets', getComplianceTargetsHandler);
router.get('/radar', getComplianceRadarHandler);

export default router;