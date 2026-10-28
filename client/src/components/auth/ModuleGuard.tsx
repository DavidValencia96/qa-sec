import React from 'react';
import { useAuth } from '../../context/useAuth';

interface ModuleGuardProps {
  moduleKey: string;
  moduleTitle: string;
  children: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  moduleKey,
  moduleTitle,
  children,
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontFamily: 'monospace' }}>
        Verificando credenciales de acceso...
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  // Acceso seguro sin `any` mediante casting a Record<string, unknown>
  const userRecord = user as unknown as Record<string, unknown>;
  const rawModules = userRecord.allowed_modules ?? userRecord.allowedModules ?? [];

  let userModules: string[] = [];
  if (Array.isArray(rawModules)) {
    userModules = rawModules as string[];
  } else if (typeof rawModules === 'string') {
    try {
      const parsed = JSON.parse(rawModules);
      if (Array.isArray(parsed)) {
        userModules = parsed as string[];
      }
    } catch {
      userModules = [];
    }
  }

  const hasModuleAccess = Array.isArray(userModules) && userModules.includes(moduleKey);
  if (isAdmin || hasModuleAccess) {
    return <>{children}</>;
  }
  
  console.log('RBAC DEBUG USER:', user);
  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '40px auto',
        backgroundColor: '#090e17',
        border: '1px solid rgba(244, 63, 94, 0.4)',
        borderRadius: '16px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(244, 63, 94, 0.15)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 16px',
          borderRadius: '14px',
          backgroundColor: 'rgba(136, 19, 55, 0.3)',
          border: '1px solid rgba(244, 63, 94, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
        }}
      >
        🔒
      </div>

      <span
        style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(136, 19, 55, 0.4)',
          border: '1px solid rgba(244, 63, 94, 0.5)',
          color: '#f43f5e',
          fontSize: '0.80rem',
          fontWeight: 700,
          fontFamily: 'monospace',
          letterSpacing: '1px',
          marginBottom: '10px',
        }}
      >
        ACCESO DENEGADO (403)
      </span>

      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          color: '#f8fafc',
          margin: '0 0 8px 0',
          letterSpacing: '0.5px',
        }}
      >
        Módulo {moduleTitle} No Autorizado
      </h3>

      <p
        style={{
          fontSize: '0.8rem',
          color: '#94a3b8',
          lineHeight: '1.6',
          maxWidth: '520px',
          margin: '0 auto 20px',
        }}
      >
        Tu cuenta <strong style={{ color: '#38bdf8' }}>{user.email}</strong> tiene rol{' '}
        <span style={{ color: '#cbd5e1', fontWeight: 600 }}>[{user.role}]</span> y no cuenta con la
        clave de autorización{' '}
        <code style={{ color: '#f43f5e', backgroundColor: '#05070e', padding: '2px 6px', borderRadius: '4px' }}>
          {moduleKey}
        </code>{' '}
        asignada en el panel &quot;RBAC&quot;.
      </p>

      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: '#05070e',
          border: '1px solid #1e293b',
          fontSize: '0.72rem',
          color: '#ffffff',
          fontFamily: 'monospace',
          display: 'inline-block',
        }}
      >
        🛡️ Contacta al administrador para solicitar acceso a este módulo.
      </div>
    </div>
  );
  
};