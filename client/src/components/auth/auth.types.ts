export type UserRole = 'ADMIN' | 'AUDITOR' | 'VIEWER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  allowed_modules: string[];
  full_name?: string | null;
  isActive?: boolean;
  is_active?: boolean;
  lastLoginAt?: string | null;
  last_login_at?: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
}