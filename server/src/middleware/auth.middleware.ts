import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth/token.service.js';
import type { AuthenticatedRequest } from '../modules/auth/auth.types.js';

const extractToken = (req: AuthenticatedRequest): string | null => {
  // 1. Prioridad: Cookie HttpOnly
  if (req.cookies && req.cookies.qa_sec_token) {
    return req.cookies.qa_sec_token;
  }
  // 2. Fallback: Cabecera Authorization Bearer
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
};

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'Token no proporcionado.' });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido o expirado.' });
  }
};

export const optionalJwt = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignora error si el token expiró para continuar en modo visitante
    }
  }
  next();
};