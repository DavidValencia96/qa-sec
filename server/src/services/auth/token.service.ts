import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { TOKEN_CONFIG } from '../../modules/auth/auth.constants.js';
import type { JwtPayload } from '../../modules/auth/auth.types.js';

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: TOKEN_CONFIG.EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};