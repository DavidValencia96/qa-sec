import { Router } from 'express';
import { requestOtp, verifyOtp, getCurrentUser } from '../controllers/auth/auth.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { otpRequestLimiter, otpVerifyLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/request-otp', otpRequestLimiter, requestOtp);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.get('/me', authenticateJwt, getCurrentUser);

export default router;