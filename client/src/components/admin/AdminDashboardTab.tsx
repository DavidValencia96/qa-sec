import React, { useEffect, useState } from 'react';
import type { UserRole } from '../auth/auth.types.js';
import { SYSTEM_MODULES_LIST, DEFAULT_ROLE_MODULES } from './admin.constants.js';
import './AdminDashboardTab.css';

interface ManagedUser {
  id: string;
  email: string;
  role: UserRole;
  allowed_modules: string[];
  is_active: boolean;
  last_login_at: string | null;
}

interface AuditLogItem {
  id: number;
  userId: string | null;
  userEmail: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('qa_sec_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const loadUsersRequest = async (): Promise<ManagedUser[]> => {
  const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
  const data = await res.json();
  return data.success ? data.users : [];
};

const loadAuditLogsRequest = async (): Promise<AuditLogItem[]> => {
  const res = await fetch('/api/admin/audit-logs', { headers: getAuthHeaders() });
  const data = await res.json();
  return data.success ? data.logs : [];
};

export const AdminDashboardTab: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [savingUser, setSavingUser] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Estados de Paginación para la tabla de Auditoría
  const [currentPage, setCurrentPage] = useState<number>(1);
  const logsPerPage = 8;

  const reloadData = async () => {
    const [usersData, logsData] = await Promise.all([loadUsersRequest(), loadAuditLogsRequest()]);
    setUsers(usersData);
    setAuditLogs(logsData);
    if (selectedUser) {
      const refreshed = usersData.find((u) => u.id === selectedUser.id);
      if (refreshed) setSelectedUser(refreshed);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    Promise.all([loadUsersRequest(), loadAuditLogsRequest()])
      .then(([u, l]) => {
        if (isSubscribed) {
          setUsers(u);
          setAuditLogs(l);
          setLoading(false);
        }
      })
      .catch(() => isSubscribed && setLoading(false));

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    if (!selectedUser) return;
    const defaultModules = DEFAULT_ROLE_MODULES[newRole] || [];
    setSelectedUser({
      ...selectedUser,
      role: newRole,
      allowed_modules: [...defaultModules],
    });
  };

  const handleToggleModule = (moduleKey: string) => {
    if (!selectedUser) return;
    const exists = selectedUser.allowed_modules.includes(moduleKey);
    const updated = exists
      ? selectedUser.allowed_modules.filter((m) => m !== moduleKey)
      : [...selectedUser.allowed_modules, moduleKey];

    setSelectedUser({ ...selectedUser, allowed_modules: updated });
  };

  const handleSaveUserAccess = async () => {
    if (!selectedUser || savingUser) return;
    setSavingUser(true);
    try {
      await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          role: selectedUser.role,
          allowedModules: selectedUser.allowed_modules,
          isActive: selectedUser.is_active,
        }),
      });

      setToastNotification(`Permisos actualizados correctamente para ${selectedUser.email}`);
      setTimeout(() => {
        setToastNotification(null);
      }, 3000);

      await reloadData();
    } catch (err) {
      alert(`Error al guardar privilegios: ${(err as Error).message}`);
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleActiveState = async (targetUser: ManagedUser) => {
    await fetch(`/api/admin/users/${targetUser.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        role: targetUser.role,
        allowedModules: targetUser.allowed_modules,
        isActive: !targetUser.is_active,
      }),
    });
    await reloadData();
  };

  // Cálculo de elementos paginados
  const totalPages = Math.ceil(auditLogs.length / logsPerPage) || 1;
  const currentLogs = auditLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage + 1;
  const endIndex = Math.min(currentPage * logsPerPage, auditLogs.length);

  return (
    <div className="admin-tab-container">
      {/* 1. HEADER & CONTADORES */}
      <div className="admin-header">
        <div className="admin-header-title-box">
          <div className="admin-header-icon">🛡️</div>
          <div>
            <h2 className="admin-header-title">CONSOLA DE ADMINISTRACIÓN Y CONTROL RBAC</h2>
            <p className="admin-header-subtitle">
              GESTIÓN GRANULAR DE IDENTIDADES, ROLES Y AUDITORÍA OWASP
            </p>
          </div>
        </div>

        <div className="admin-stats-box">
          <div className="admin-stat-card">
            <span style={{ color: '#94a3b8' }}>Usuarios Registrados:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>
              {users.length}
            </span>
          </div>
          <div className="admin-stat-card active">
            <span style={{ color: '#94a3b8' }}>Activos:</span>
            <span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>
              {users.filter((u) => u.is_active).length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. GRID PRINCIPAL (TABLA 70% / EDITOR CHECKLIST 30%) */}
      <div className="admin-panels-grid">
        {/* TABLA PRINCIPAL DE IDENTIDADES */}
        <div className="admin-card-panel">
          <div className="admin-panel-top">
            <span className="admin-panel-heading">● Directorio de Identidades y Accesos</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
              Auto-Sync Cloud
            </span>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Identidad / Email</th>
                  <th>Rol Base</th>
                  <th>Módulos</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      Cargando directorio de credenciales...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        className={`admin-table-row ${isSelected ? 'selected' : ''}`}
                      >
                        <td>
                          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{u.email}</span>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.65rem',
                              color: '#64748b',
                              fontFamily: 'sans-serif',
                              marginTop: '2px',
                            }}
                          >
                            {u.last_login_at
                              ? `Último login: ${new Date(u.last_login_at).toLocaleDateString()}`
                              : 'Sin login previo'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-role ${u.role}`}>{u.role}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#111827',
                              border: '1px solid #1e293b',
                              color: '#cbd5e1',
                              fontSize: '0.7rem',
                            }}
                          >
                            {u.allowed_modules?.length || 0} / {SYSTEM_MODULES_LIST.length}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status ${u.is_active ? 'active' : 'suspended'}`}>
                            {u.is_active ? '● Activo' : '● Suspendido'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="btn-action-primary"
                          >
                            Permisos
                          </button>
                          <button
                            onClick={() => handleToggleActiveState(u)}
                            className={`btn-action-toggle ${u.is_active ? 'suspend' : 'activate'}`}
                          >
                            {u.is_active ? 'Suspender' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHECKLIST LATERAL DE MÓDULOS */}
        <div className="admin-card-panel">
          {selectedUser ? (
            <div>
              <div
                style={{
                  borderBottom: '1px solid #1e293b',
                  paddingBottom: '12px',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                  }}
                >
                  CONFIGURACIÓN DE ACCESOS
                </span>
                <h4
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '0.85rem',
                    color: '#f8fafc',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedUser.email}
                </h4>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    marginBottom: '6px',
                    fontWeight: 600,
                  }}
                >
                  Rol Base Asignado
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    backgroundColor: '#050811',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ADMIN">ADMIN (Acceso Total + Root)</option>
                  <option value="AUDITOR">AUDITOR (Ejecución de Scanners)</option>
                  <option value="VIEWER">VIEWER (Solo Lectura)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    marginBottom: '8px',
                    fontWeight: 600,
                  }}
                >
                  Módulos Habilitados (Checklist Granular)
                </label>
                <div style={{ maxHeight: '310px', overflowY: 'auto', paddingRight: '4px' }}>
                  {SYSTEM_MODULES_LIST.map((mod) => {
                    const isChecked = selectedUser.allowed_modules.includes(mod.key);
                    return (
                      <label
                        key={mod.key}
                        className={`checklist-item ${isChecked ? 'checked' : ''}`}
                      >
                        <div className="checklist-label">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleModule(mod.key)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ color: isChecked ? '#e2e8f0' : '#64748b' }}>
                            {mod.label}
                          </span>
                        </div>
                        <span className="checklist-badge">{mod.key}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveUserAccess}
                  disabled={savingUser}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: savingUser ? '#075985' : '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: savingUser ? 'wait' : 'pointer',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {savingUser ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    border: 'none',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 10px', color: '#64748b', margin: 'auto' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚙️</div>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Editor en Espera
              </h5>
              <p style={{ margin: 0, fontSize: '0.7rem' }}>
                Selecciona un usuario en la tabla para modificar sus privilegios y matriz de módulos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. LOGS DE AUDITORÍA CON PAGINACIÓN */}
      <div className="admin-card-panel">
        <div className="admin-panel-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#fbbf24', fontSize: '16px' }}>📜</span>
            <span className="admin-panel-heading">Registro de Auditoría de Acciones Críticas</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
            Trazabilidad Inmutable
          </span>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Detalles</th>
                <th>IP Origen</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No hay registros de auditoría recientes.
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id} className="admin-table-row">
                    <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ color: '#38bdf8', fontWeight: 600 }}>{log.userEmail}</td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(217, 119, 6, 0.2)',
                          color: '#fbbf24',
                          border: '1px solid rgba(217, 119, 6, 0.4)',
                          fontSize: '0.65rem',
                          fontFamily: 'sans-serif',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{log.module}</td>
                    <td style={{ color: '#94a3b8' }}>{log.details}</td>
                    <td style={{ color: '#64748b' }}>{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BARRA DE CONTROL DE PAGINACIÓN */}
        {auditLogs.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #1e293b',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
              Mostrando <strong style={{ color: '#94a3b8' }}>{startIndex}</strong> a{' '}
              <strong style={{ color: '#94a3b8' }}>{endIndex}</strong> de{' '}
              <strong style={{ color: '#38bdf8' }}>{auditLogs.length}</strong> eventos
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: currentPage === 1 ? '#090e17' : '#1e293b',
                  color: currentPage === 1 ? '#475569' : '#e2e8f0',
                  border: '1px solid #334155',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                ◀ Anterior
              </button>

              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  padding: '4px 8px',
                  backgroundColor: '#050811',
                  borderRadius: '4px',
                  border: '1px solid #1e293b',
                }}
              >
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: currentPage === totalPages ? '#090e17' : '#1e293b',
                  color: currentPage === totalPages ? '#475569' : '#e2e8f0',
                  border: '1px solid #334155',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TOAST FLOTANTE TEMPORAL (3 SEGUNDOS) */}
      {toastNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#052e16',
            color: '#4ade80',
            border: '1px solid #16a34a',
            borderRadius: '10px',
            padding: '12px 20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            zIndex: 999999,
          }}
        >
          <span style={{ fontSize: '1rem' }}>✅</span>
          <span>{toastNotification}</span>
        </div>
      )}
    </div>
  );
};