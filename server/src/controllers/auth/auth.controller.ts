import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateSecureNumericOtp, hashOtp, saveOtpChallenge, findValidOtp, decrementOtpAttempts, markOtpConsumed } from '../../services/auth/otp.service.js';
import { findUserByEmail, createViewerUser, updateLastLogin } from '../../services/auth/user.repository.js';
import { emailService } from '../../services/auth/email.service.js';
import { signAccessToken } from '../../services/auth/token.service.js';
import type { AuthenticatedRequest, UserRecord } from '../../modules/auth/auth.types.js';

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ success: false, error: 'Email inválido.' });
    return;
  }

  const otp = generateSecureNumericOtp();
  await saveOtpChallenge(email, hashOtp(otp));
  await emailService.sendOtpEmail(email, otp);
  res.json({ success: true, message: 'Código de verificación despachado.' });
};

const resolveUserSession = async (email: string): Promise<UserRecord> => {
  let user = await findUserByEmail(email);
  if (!user) {
    const newId = uuidv4();
    await createViewerUser(newId, email);
    user = await findUserByEmail(email);
  }
  return user!;
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, code } = req.body;
  const challenge = await findValidOtp(email);
  if (!challenge || challenge.otp_code !== hashOtp(code)) {
    if (challenge) await decrementOtpAttempts(challenge.id);
    res.status(400).json({ success: false, error: 'Código inválido o expirado.' });
    return;
  }

  await markOtpConsumed(challenge.id);
  const user = await resolveUserSession(email);
  await updateLastLogin(user.id);

  const token = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  res.json({ success: true, token, user });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await findUserByEmail(req.user!.email);
  if (!user || !user.is_active) {
    res.status(401).json({ success: false, error: 'Usuario inactivo o no encontrado.' });
    return;
  }
  res.json({ success: true, user });
};