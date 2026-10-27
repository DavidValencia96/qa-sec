export type UserRole = 'ADMIN' | 'AUDITOR' | 'VIEWER';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
}