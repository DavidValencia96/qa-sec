import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

// 1. Límite para solicitud de códigos OTP (evita saturación y costos de correos)
// Máximo 3 solicitudes cada 15 minutos por IP o por cuenta de correo
export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false }, // Desactiva la alerta estricta de fallback al usar clave híbrida
  keyGenerator: (req: Request) => {
    const clientIp = ipKeyGenerator(req.ip || '127.0.0.1');
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : '';
    return email ? `${clientIp}_${email}` : clientIp;
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes de código OTP. Por favor espera 15 minutos antes de reintentar.',
    });
  },
});

// 2. Límite estricto para verificación de OTP (Anti-Fuerza Bruta)
// Máximo 3 intentos fallidos cada 10 minutos
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req: Request) => {
    const clientIp = ipKeyGenerator(req.ip || '127.0.0.1');
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : '';
    return email ? `${clientIp}_${email}` : clientIp;
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Límite de intentos de verificación excedido. Tu acceso ha sido bloqueado temporalmente por 10 minutos.',
    });
  },
});

// 3. Límite defensivo para escaneos públicos (/api/tests/run)
export const guestScanLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const authHeader = req.headers.authorization;
    return Boolean(authHeader && authHeader.startsWith('Bearer '));
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Has alcanzado la cuota de escaneos gratuitos por IP. Inicia sesión para continuar sin restricciones.',
    });
  },
});