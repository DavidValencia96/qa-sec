import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDbPool } from '../../config/database.js';
import { OTP_CONFIG } from '../../modules/auth/auth.constants.js';

export const generateSecureNumericOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashOtp = (code: string): string => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

const calculateExpiration = (): Date => {
  return new Date(Date.now() + OTP_CONFIG.EXPIRATION_MINUTES * 60 * 1000);
};

export const saveOtpChallenge = async (email: string, hashedCode: string): Promise<void> => {
  const pool = getDbPool();
  const query = `
    INSERT INTO auth_otps (id, email, otp_code, attempts_left, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `;
  await pool.query(query, [
    uuidv4(),
    email.toLowerCase().trim(),
    hashedCode,
    OTP_CONFIG.MAX_ATTEMPTS,
    calculateExpiration(),
  ]);
};

export const findValidOtp = async (email: string): Promise<any | null> => {
  const pool = getDbPool();
  const query = `
    SELECT * FROM auth_otps
    WHERE email = ? AND consumed = FALSE AND expires_at > NOW() AND attempts_left > 0
    ORDER BY created_at DESC LIMIT 1
  `;
  const [rows] = await pool.query<any[]>(query, [email.toLowerCase().trim()]);
  return rows.length > 0 ? rows[0] : null;
};

export const decrementOtpAttempts = async (otpId: string): Promise<void> => {
  const pool = getDbPool();
  const query = `UPDATE auth_otps SET attempts_left = attempts_left - 1 WHERE id = ?`;
  await pool.query(query, [otpId]);
};

export const markOtpConsumed = async (otpId: string): Promise<void> => {
  const pool = getDbPool();
  const query = `UPDATE auth_otps SET consumed = TRUE WHERE id = ?`;
  await pool.query(query, [otpId]);
};