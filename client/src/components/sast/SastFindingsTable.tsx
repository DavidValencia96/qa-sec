import React from 'react';
import type { SastFinding } from './sast.types';

interface SastFindingsTableProps {
  findings: SastFinding[];
}

export const SastFindingsTable: React.FC<SastFindingsTableProps> = ({ findings }) => {
  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: '#ef4444',
      HIGH: '#f97316',
      MEDIUM: '#eab308',
      LOW: '#22c55e',
      INFO: '#3b82f6',
    };
    return colors[severity] || '#6b7280';
  };

  const getTypeBadge = (type: string) => {
    if (type === 'SECRET_EXPOSED') return '🔑 Secreto Expuesto';
    if (type === 'VULNERABLE_DEPENDENCY') return '📦 Dependencia Vulnerable';
    return '🛡️ Vulnerabilidad de Código';
  };

  if (findings.length === 0) {
    return (
      <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #22c55e', color: '#86efac' }}>
        ✅ No se detectaron secretos hardcodeados ni vulnerabilidades en este análisis.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {findings.map((f) => (
        <div
          key={f.id}
          style={{
            background: '#18181b',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #27272a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                background: getSeverityBadge(f.severity),
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {f.severity}
            </span>
            <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold' }}>{getTypeBadge(f.type)}</span>
            <span style={{ color: '#f4f4f5', fontWeight: 'bold' }}>{f.title}</span>
            {f.lineNumber && <small style={{ color: '#a1a1aa' }}>(Línea {f.lineNumber})</small>}
          </div>

          <p style={{ color: '#d4d4d8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>{f.description}</p>

          {f.snippet && (
            <pre
              style={{
                background: '#09090b',
                padding: '8px',
                borderRadius: '4px',
                color: '#f87171',
                fontSize: '0.8rem',
                margin: '0 0 8px 0',
                overflowX: 'auto',
              }}
            >
              {f.snippet}
            </pre>
          )}

          <div style={{ color: '#86efac', fontSize: '0.8rem' }}>
            <strong>💡 Recomendación:</strong> {f.recommendation}
          </div>
        </div>
      ))}
    </div>
  );
};