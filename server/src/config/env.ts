import dotenv from 'dotenv';
import path from 'path';

// Carga tanto de la raíz como de server/.env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface ResendConfig {
  apiKey: string;
  from: string;
}

export interface AppConfig {
  port: number;
  geminiApiKey: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPass: string;
  dbName: string;
  viteApiUrl: string;
  jwtSecret: string;
  smtp: SmtpConfig;
  resend: ResendConfig;
}

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config: AppConfig = {
  port: getEnvNumber('PORT', 3000),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: getEnvNumber('DB_PORT', 3306),
  dbUser: process.env.DB_USER || 'root',
  dbPass: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'qa_sec_db',
  viteApiUrl: process.env.VITE_API_URL || 'http://localhost:3000/api',
  jwtSecret: process.env.JWT_SECRET || 'qa-sec-suite-fallback-secret-key-32chars',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: getEnvNumber('SMTP_PORT', 587),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'QA-Sec Suite Security <no-reply@qa-sec.local>',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'QA-Sec Suite <onboarding@resend.dev>',
  },
};