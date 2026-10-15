import mysql, { Pool } from 'mysql2/promise';
import { config } from './env.js';

let poolInstance: Pool | null = null;

export const getDbPool = (): Pool => {
  if (!poolInstance) {
    poolInstance = mysql.createPool({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPass,
      database: config.dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return poolInstance;
};

export const testDbConnection = async (): Promise<boolean> => {
  try {
    const connection = await getDbPool().getConnection();
    connection.release();
    console.log('[+] Conexión a MySQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('[!] Error conectando a MySQL:', error);
    return false;
  }
};