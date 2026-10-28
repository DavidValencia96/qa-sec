import { Request, Response } from 'express';
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
        message: 'Código despachado (Modo local activado: revisa la terminal del servidor).',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Código de verificación despachado a tu correo corporativo.',
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

    const challenge = await findValidOtp(cleanEmail);
    if (!challenge || challenge.otp_code !== hashOtp(cleanCode)) {
      if (challenge) await decrementOtpAttempts(challenge.id);
      res.status(400).json({ success: false, error: 'Código inválido o expirado.' });
      return;
    }

    await markOtpConsumed(challenge.id);
    const user = await resolveUserSession(cleanEmail);

    if (!user.is_active) {
      res.status(403).json({ success: false, error: 'Tu cuenta ha sido suspendida por el administrador.' });
      return;
    }

    await updateLastLogin(user.id);

    // Se incluye allowed_modules requerido por la interfaz JwtPayload
    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      allowed_modules: user.allowed_modules,
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