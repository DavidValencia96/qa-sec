import { getDbPool } from '../../config/database.js';
import type { UserRecord, UserRole } from '../../modules/auth/auth.types.js';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role_name: UserRole;
  is_active: number;
  last_login_at: Date | null;
}

const mapUserRow = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  full_name: row.full_name,
  role: row.role_name,
  is_active: Boolean(row.is_active),
  last_login_at: row.last_login_at,
});

export const findUserByEmail = async (email: string): Promise<UserRecord | null> => {
  const pool = getDbPool();
  const query = `
    SELECT u.id, u.email, u.full_name, r.name as role_name, u.is_active, u.last_login_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    WHERE u.email = ? LIMIT 1
  `;
  const [rows] = await pool.query<any[]>(query, [email.toLowerCase().trim()]);
  return rows.length > 0 ? mapUserRow(rows[0]) : null;
};

export const createViewerUser = async (id: string, email: string): Promise<void> => {
  const pool = getDbPool();
  const query = `
    INSERT INTO users (id, email, role_id, is_active)
    SELECT ?, ?, id, TRUE FROM roles WHERE name = 'VIEWER' LIMIT 1
  `;
  await pool.query(query, [id, email.toLowerCase().trim()]);
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  const pool = getDbPool();
  const query = `UPDATE users SET last_login_at = NOW() WHERE id = ?`;
  await pool.query(query, [userId]);
};