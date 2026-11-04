import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDbPool } from '../../config/database.js';
import { OTP_CONFIG } from '../../modules/auth/auth.constants.js';
import { config } from '../../config/env.js';

export interface OtpChallengeRecord {
  id: string;
  email: string;
  otp_code: string;
  attempts_left: number;
  expires_at: Date;
  consumed: boolean;
  created_at: Date;
}

// Generación criptográfica uniforme en el rango [100000, 999999]
export const generateSecureNumericOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

// HMAC-SHA256 con pepper de servidor para mitigar ataques de diccionario offline
export const hashOtp = (code: string): string => {
  return crypto
    .createHmac('sha256', config.jwtSecret)
    .update(code.trim())
    .digest('hex');
};

const calculateExpiration = (): Date => {
  return new Date(Date.now() + OTP_CONFIG.EXPIRATION_MINUTES * 60 * 1000);
};

// Invalida atómicamente retos anteriores y guarda el nuevo reto
export const saveOtpChallenge = async (email: string, hashedCode: string): Promise<void> => {
  const pool = getDbPool();
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Revocar de inmediato cualquier reto activo previo del mismo email
  const invalidatePreviousQuery = `
    UPDATE auth_otps 
    SET consumed = TRUE 
    WHERE email = ? AND consumed = FALSE AND expires_at > NOW()
  `;
  await pool.query(invalidatePreviousQuery, [normalizedEmail]);

  // 2. Insertar el nuevo reto seguro
  const insertQuery = `
    INSERT INTO auth_otps (id, email, otp_code, attempts_left, expires_at, consumed)
    VALUES (?, ?, ?, ?, ?, FALSE)
  `;
  await pool.query(insertQuery, [
    uuidv4(),
    normalizedEmail,
    hashedCode,
    OTP_CONFIG.MAX_ATTEMPTS,
    calculateExpiration(),
  ]);
};

// Localiza el reto activo más reciente
export const findValidOtp = async (email: string): Promise<OtpChallengeRecord | null> => {
  const pool = getDbPool();
  const query = `
    SELECT id, email, otp_code, attempts_left, expires_at, consumed, created_at 
    FROM auth_otps
    WHERE email = ? 
      AND consumed = FALSE 
      AND expires_at > NOW() 
      AND attempts_left > 0
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const [rows] = await pool.query<any[]>(query, [email.toLowerCase().trim()]);
  return rows.length > 0 ? (rows[0] as OtpChallengeRecord) : null;
};

// Reducción atómica: si los intentos llegan a 0, se marca como consumido automáticamente
export const decrementOtpAttempts = async (otpId: string): Promise<void> => {
  const pool = getDbPool();
  const query = `
    UPDATE auth_otps 
    SET 
      attempts_left = GREATEST(attempts_left - 1, 0),
      consumed = IF(attempts_left - 1 <= 0, TRUE, consumed)
    WHERE id = ?
  `;
  await pool.query(query, [otpId]);
};

// Invalida definitivamente el reto una vez validado con éxito
export const markOtpConsumed = async (otpId: string): Promise<void> => {
  const pool = getDbPool();
  const query = `UPDATE auth_otps SET consumed = TRUE, attempts_left = 0 WHERE id = ?`;
  await pool.query(query, [otpId]);
};

// Tarea periódica de limpieza defensiva de retos expirados
export const cleanupExpiredOtps = async (): Promise<void> => {
  const pool = getDbPool();
  const query = `DELETE FROM auth_otps WHERE expires_at < NOW() - INTERVAL 1 DAY`;
  await pool.query(query);
};