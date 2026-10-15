import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  port: number;
  geminiApiKey: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPass: string;
  dbName: string;
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
};