export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRATION_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  PURGE_HOURS: 24,
} as const;

export const TOKEN_CONFIG = {
  EXPIRES_IN: '8h',
} as const;