import { getDbPool } from '../../config/database.js';
import type { UserRecord, UserRole } from '../../modules/auth/auth.types.js';

export const fetchAllUsers = async (): Promise<UserRecord[]> => {
  const pool = getDbPool();
  const query = `
    SELECT u.id, u.email, u.full_name, r.name as role, u.is_active, u.last_login_at
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `;
  const [rows] = await pool.query<any[]>(query);
  return rows.map((r) => ({ ...r, is_active: Boolean(r.is_active) }));
};

export const updateUserRoleAndStatus = async (
  userId: string,
  roleName: UserRole,
  isActive: boolean
): Promise<void> => {
  const pool = getDbPool();
  const query = `
    UPDATE users 
    SET role_id = (SELECT id FROM roles WHERE name = ? LIMIT 1),
        is_active = ?
    WHERE id = ?
  `;
  await pool.query(query, [roleName, isActive, userId]);
};