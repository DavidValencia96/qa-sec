import React from 'react';
import type { SastFinding } from './sast.types';

interface SastFindingsTableProps {
  findings: SastFinding[];
}

export const SastFindingsTable: React.FC<SastFindingsTableProps> = ({ findings }) => {
  const getSeverityBadge = (severity: string) => {
    const sev = (severity || 'UNKNOWN').toUpperCase();
    let bg = 'rgba(100, 116, 139, 0.2)';
    let color = '#94a3b8';
    let border = '#64748b';

    if (sev === 'CRITICAL') {
      bg = 'rgba(220, 38, 38, 0.25)';
      color = '#f87171';
      border = '#ef4444';
    } else if (sev === 'HIGH') {
      bg = 'rgba(234, 88, 12, 0.25)';
      color = '#fb923c';
      border = '#f97316';
    } else if (sev === 'MEDIUM') {
      bg = 'rgba(202, 138, 4, 0.25)';
      color = '#facc15';
      border = '#eab308';
    } else if (sev === 'LOW') {
      bg = 'rgba(22, 101, 52, 0.25)';
      color = '#4ade80';
      border = '#22c55e';
    } else if (sev === 'INFO') {
      bg = 'rgba(59, 130, 246, 0.25)';
      color = '#60a5fa';
      border = '#3b82f6';
    }

    return (
      <span
        style={{
          background: bg,
          color,
          border: `1px solid ${border}`,
          padding: '3px 10px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        {sev}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    if (type === 'SECRET_EXPOSED') return '🔑 Secreto Expuesto';
    if (type === 'VULNERABLE_DEPENDENCY') return '📦 Dependencia Vulnerable';
    return '🛡️ Vulnerabilidad de Código';
  };

  if (findings.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(6, 78, 59, 0.2)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #22c55e',
          color: '#86efac',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        ✅ No se detectaron secretos hardcodeados ni vulnerabilidades en este análisis.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {findings.map((f) => (
        <div
          key={f.id}
          style={{
            background: 'rgba(15, 23, 42, 0.5)',
            padding: '18px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {getSeverityBadge(f.severity)}
            <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold' }}>{getTypeBadge(f.type)}</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.95rem' }}>{f.title}</span>
            {f.lineNumber && <small style={{ color: '#94a3b8' }}>(Línea {f.lineNumber})</small>}
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 10px 0', lineHeight: '1.5' }}>
            {f.description}
          </p>

          {f.snippet && (
            <pre
              style={{
                background: '#09090b',
                padding: '10px 12px',
                borderRadius: '6px',
                color: '#f87171',
                fontSize: '0.82rem',
                margin: '0 0 10px 0',
                overflowX: 'auto',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontFamily: 'Consolas, Monaco, monospace',
              }}
            >
              {f.snippet}
            </pre>
          )}

          <div style={{ color: '#4ade80', fontSize: '0.85rem', background: 'rgba(34, 197, 94, 0.1)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <strong>💡 Recomendación:</strong> {f.recommendation}
          </div>
        </div>
      ))}
    </div>
  );
};