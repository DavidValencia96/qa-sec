import { Request } from 'express';
import { SystemModuleKey } from './auth.constants.js';

export type UserRole = 'ADMIN' | 'AUDITOR' | 'VIEWER';

export interface UserRecord {
  readonly id: string;
  readonly email: string;
  readonly full_name: string | null;
  readonly role: UserRole;
  readonly allowed_modules: SystemModuleKey[];
  readonly is_active: boolean;
  readonly last_login_at: Date | null;
}

export interface JwtPayload {
  readonly userId: string;
  readonly email: string;
  readonly role: UserRole;
  readonly allowed_modules: SystemModuleKey[];
}

export interface OtpRecord {
  readonly id: string;
  readonly email: string;
  readonly otp_code: string;
  readonly attempts_left: number;
  readonly expires_at: Date;
  readonly consumed: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}