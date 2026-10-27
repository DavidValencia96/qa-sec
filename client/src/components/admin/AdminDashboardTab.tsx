import React, { useEffect, useState } from 'react';
import type { AuthUser, UserRole } from '../auth/auth.types.js';

const loadUsersRequest = async (): Promise<AuthUser[]> => {
  const token = localStorage.getItem('qa_sec_token');
  const res = await fetch('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.success ? data.users : [];
};

export const AdminDashboardTab: React.FC = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isSubscribed = true;

    loadUsersRequest()
      .then((data) => {
        if (isSubscribed) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleUpdateRole = async (userId: string, role: UserRole, isActive: boolean) => {
    const token = localStorage.getItem('qa_sec_token');
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role, isActive }),
    });
    const updatedUsers = await loadUsersRequest();
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-cyan-400">🛡️ Consola de Administración y Control RBAC</h2>
        <p className="text-sm text-gray-400">
          Gestiona permisos de usuarios y visualiza la traza de accesos en el sistema.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#0b1019]">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="border-b border-gray-800 bg-gray-900/50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol Actual</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Último Acceso</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-500">Cargando usuarios...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-850/30">
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole, u.isActive)}
                      className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-cyan-300"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="AUDITOR">AUDITOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${u.isActive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-red-950/60 text-red-400 border border-red-800'}`}>
                      {u.isActive ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Nunca'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleUpdateRole(u.id, u.role, !u.isActive)}
                      className="text-xs text-gray-400 hover:text-white underline"
                    >
                      {u.isActive ? 'Suspender' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};