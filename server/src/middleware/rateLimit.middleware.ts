import rateLimit from 'express-rate-limit';

// 1. Límite para solicitud de códigos OTP (evita flooding de correos y costos de envío)
// Máximo 3 solicitudes de OTP cada 15 minutos por IP
export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes de código OTP. Por favor espera 15 minutos antes de reintentar.',
  },
});

// 2. Límite para verificación de OTP (mitiga ataques de fuerza bruta al código de 6 dígitos)
// Máximo 5 intentos de verificación cada 10 minutos por IP
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Límite de intentos de verificación excedido. Tu acceso ha sido bloqueado temporalmente por 10 minutos.',
  },
});

// 3. Límite defensivo para escaneos públicos de invitados (/api/tests/run)
// Máximo 10 escaneos cada 10 minutos por IP para usuarios sin sesión
export const guestScanLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Si la petición viene con token JWT válido (usuario logueado), no se le aplica el límite estricto de invitado
    const authHeader = req.headers.authorization;
    return Boolean(authHeader && authHeader.startsWith('Bearer '));
  },
  message: {
    success: false,
    error: 'Has alcanzado la cuota de escaneos gratuitos por IP. Inicia sesión para continuar sin restricciones.',
  },
});