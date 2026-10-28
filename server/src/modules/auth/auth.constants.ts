export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRATION_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  PURGE_HOURS: 24,
} as const;

export const TOKEN_CONFIG = {
  EXPIRES_IN: '8h',
} as const;

export const SYSTEM_MODULES = [
  'SAST',
  'DAST',
  'SCA',
  'EASM',
  'REDTEAM',
  'EMAILSEC',
  'LOADTEST',
  'NETWORK',
  'COMPLIANCE',
  'REPORTS',
  'CVE',
  'ADMIN',
] as const;

export type SystemModuleKey = (typeof SYSTEM_MODULES)[number];

export const DEFAULT_VIEWER_MODULES: readonly SystemModuleKey[] = ['REPORTS', 'COMPLIANCE', 'CVE'] as const;