import { Request } from 'express';

export type UserRole = 'ADMIN' | 'AUDITOR' | 'VIEWER';

export interface UserRecord {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: Date | null;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface OtpRecord {
  id: string;
  email: string;
  otp_code: string;
  attempts_left: number;
  expires_at: Date;
  consumed: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}