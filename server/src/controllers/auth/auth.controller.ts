import { Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  generateSecureNumericOtp,
  hashOtp,
  saveOtpChallenge,
  findValidOtp,
  decrementOtpAttempts,
  markOtpConsumed,
} from '../../services/auth/otp.service.js';
import {
  findUserByEmail,
  createViewerUser,
  updateLastLogin,
} from '../../services/auth/user.repository.js';
import { emailService } from '../../services/auth/email.service.js';
import { signAccessToken } from '../../services/auth/token.service.js';
import type { AuthenticatedRequest, UserRecord } from '../../modules/auth/auth.types.js';

// Comparación segura en tiempo constante para mitigar Timing Attacks
const safeCompareHash = (providedHash: string, storedHash: string): boolean => {
  const bufA = Buffer.from(providedHash);
  const bufB = Buffer.from(storedHash);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Email corporativo inválido.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = generateSecureNumericOtp();

    // 1. Guardar el reto hash en base de datos
    await saveOtpChallenge(cleanEmail, hashOtp(otp));

    // 2. Despachar correo (Resend -> SMTP -> Consola)
    const delivered = await emailService.sendOtpEmail(cleanEmail, otp);

    if (!delivered) {
      res.json({
        success: true,
        message: 'Código enviado (Modo local activado: revisa la terminal del servidor).',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Código de verificación enviado a tu correo corporativo.',
    });
  } catch (error: any) {
    console.error('[AUTH-CONTROLLER] Error en requestOtp:', error);
    res.status(500).json({ success: false, error: 'No se pudo procesar la solicitud de autenticación.' });
  }
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
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, error: 'Email y código son obligatorios.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // Validación de formato: únicamente 6 dígitos numéricos
    if (!/^\d{6}$/.test(cleanCode)) {
      res.status(400).json({ success: false, error: 'El formato del código debe ser de 6 dígitos numéricos.' });
      return;
    }

    const challenge = await findValidOtp(cleanEmail);
    const providedHash = hashOtp(cleanCode);

    if (!challenge || !safeCompareHash(providedHash, challenge.otp_code)) {
      if (challenge) {
        await decrementOtpAttempts(challenge.id);
        if (challenge.attempts_left <= 1) {
          await markOtpConsumed(challenge.id);
        }
      }
      res.status(400).json({ success: false, error: 'Código inválido o expirado.' });
      return;
    }

    // Código correcto: se consume de inmediato para impedir cualquier reuso
    await markOtpConsumed(challenge.id);
    const user = await resolveUserSession(cleanEmail);

    if (!user.is_active) {
      res.status(403).json({ success: false, error: 'Tu cuenta ha sido suspendida por el administrador.' });
      return;
    }

    await updateLastLogin(user.id);

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      allowed_modules: user.allowed_modules,
    });

    // Emisión segura de sesión en Cookie HttpOnly
    res.cookie('qa_sec_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas de vigencia
      path: '/',
    });

    res.json({ success: true, token, user });
  } catch (error: any) {
    console.error('[AUTH-CONTROLLER] Error en verifyOtp:', error);
    res.status(500).json({ success: false, error: 'Error interno al verificar el código.' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.email) {
      res.status(401).json({ success: false, error: 'No autorizado.' });
      return;
    }

    const user = await findUserByEmail(req.user.email);
    if (!user || !user.is_active) {
      res.status(401).json({ success: false, error: 'Usuario inactivo o no encontrado.' });
      return;
    }
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('[AUTH-CONTROLLER] Error en getCurrentUser:', error);
    res.status(500).json({ success: false, error: 'Error al recuperar usuario.' });
  }
};

export const logoutController = (_req: Request, res: Response): void => {
  res.clearCookie('qa_sec_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Sesión finalizada exitosamente.' });
};