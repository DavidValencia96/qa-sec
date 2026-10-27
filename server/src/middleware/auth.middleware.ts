import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth/token.service.js';
import type { AuthenticatedRequest } from '../modules/auth/auth.types.js';

const extractBearerToken = (authHeader?: string): string | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7).trim();
};

export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = extractBearerToken(req.headers.authorization);
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