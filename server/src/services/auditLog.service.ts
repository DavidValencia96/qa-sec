import { getDbPool } from '../config/database.js';

export interface AuditLogEntry {
  id?: number;
  userId?: string | null;
  userEmail: string;
  action: 'ROLE_CHANGE' | 'USER_SUSPEND' | 'TEST_RUN' | 'REPORT_EXPORT';
  module: string;
  details: string;
  ipAddress?: string;
  createdAt?: string;
}

export const logAuditEvent = async (entry: AuditLogEntry): Promise<void> => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, user_email, action, module, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    await getDbPool().execute(query, [
      entry.userId || null,
      entry.userEmail,
      entry.action,
      entry.module,
      entry.details,
      entry.ipAddress || null,
    ]);
  } catch (error) {
    console.error('[AUDIT-LOG-ERROR] No se pudo registrar la traza:', error);
  }
};

export const fetchAuditLogs = async (limit: number = 50): Promise<AuditLogEntry[]> => {
  try {
    const query = `
      SELECT 
        id, 
        user_id AS userId, 
        user_email AS userEmail, 
        action, 
        module, 
        details, 
        ip_address AS ipAddress, 
        created_at AS createdAt 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const [rows] = await getDbPool().execute(query, [String(limit)]);
    return rows as AuditLogEntry[];
  } catch (error) {
    console.error('[AUDIT-LOG-ERROR] Error al consultar los registros de auditoría:', error);
    return [];
  }
};