import { Router } from 'express';
import { requestOtp, verifyOtp, getCurrentUser } from '../controllers/auth/auth.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authenticateJwt, getCurrentUser);

export default router;