import { getDbPool } from '../../config/database.js';
import type { UserRecord, UserRole } from '../../modules/auth/auth.types.js';
import type { SystemModuleKey } from '../../modules/auth/auth.constants.js';

const parseAllowedModules = (rawModules: unknown): SystemModuleKey[] => {
  if (Array.isArray(rawModules)) return rawModules as SystemModuleKey[];
  if (typeof rawModules === 'string') {
    try {
      const parsed = JSON.parse(rawModules);
      return Array.isArray(parsed) ? (parsed as SystemModuleKey[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const fetchAllUsers = async (): Promise<UserRecord[]> => {
  const pool = getDbPool();
  const query = `
    SELECT u.id, u.email, u.full_name, r.name as role, u.allowed_modules, u.is_active, u.last_login_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `;
  const [rows] = await pool.query<any[]>(query);
  return rows.map((r) => ({
    ...r,
    is_active: Boolean(r.is_active),
    allowed_modules: parseAllowedModules(r.allowed_modules),
  }));
};

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const pool = getDbPool();
  const query = `
    SELECT u.id, u.email, u.full_name, r.name as role, u.allowed_modules, u.is_active, u.last_login_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE LOWER(u.email) = LOWER(?)
    LIMIT 1
  `;
  const [rows] = await pool.query<any[]>(query, [email]);
  if (!rows || rows.length === 0) return null;

  const r = rows[0];
  return {
    ...r,
    is_active: Boolean(r.is_active),
    allowed_modules: parseAllowedModules(r.allowed_modules),
  };
};

export const createViewerUser = async (id: string, email: string): Promise<void> => {
  const pool = getDbPool();
  const query = `
    INSERT INTO users (id, email, role_id, allowed_modules, is_active, created_at)
    VALUES (?, ?, (SELECT id FROM roles WHERE name = 'VIEWER' LIMIT 1), '[]', 1, NOW())
  `;
  await pool.query(query, [id, email]);
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  const pool = getDbPool();
  const query = `UPDATE users SET last_login_at = NOW() WHERE id = ?`;
  await pool.query(query, [userId]);
};

export const updateUserRoleAndStatus = async (
  userId: string,
  roleName: UserRole,
  allowedModules: SystemModuleKey[],
  isActive: boolean
): Promise<void> => {
  const pool = getDbPool();
  const query = `
    UPDATE users 
    SET role_id = (SELECT id FROM roles WHERE name = ? LIMIT 1),
        allowed_modules = ?,
        is_active = ?
    WHERE id = ?
  `;
  await pool.query(query, [roleName, JSON.stringify(allowedModules), isActive, userId]);
};