import React, { useState } from 'react';
import type { HistoryItem } from './history.types';

interface HistoryTableProps {
  items: HistoryItem[];
  onOpenReportModal: (item: HistoryItem) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ items, onOpenReportModal }) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '20px' }}>
        No se encontraron reportes en la base de datos.
      </p>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #333', borderRadius: '6px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e5e7eb', fontSize: '13px', textAlign: 'left', minWidth: '950px' }}>
        <thead>
          <tr style={{ background: '#27272a', color: '#9ca3af', borderBottom: '1px solid #3f3f46' }}>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Tipo</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>ID Ejecución</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Proyecto</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>URL Objetivo</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Suite / Módulo</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Fecha</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Estado</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Hallazgos</th>
            <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.runId}
              onMouseEnter={() => setHoveredRow(item.runId)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                borderBottom: '1px solid #27272a',
                background: hoveredRow === item.runId ? '#2a2a2e' : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Tipo */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    background: item.auditType === 'NETWORK_AUDIT' ? '#312e81' : '#1e3a8a',
                    color: item.auditType === 'NETWORK_AUDIT' ? '#a5b4fc' : '#93c5fd',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: `1px solid ${item.auditType === 'NETWORK_AUDIT' ? '#4338ca' : '#1d4ed8'}`,
                  }}
                >
                  {item.auditType === 'NETWORK_AUDIT' ? '🌐 Red' : '💻 Web'}
                </span>
              </td>

              {/* ID Ejecución Completo */}
              <td style={{ padding: '12px 16px' }}>
                <code
                  style={{
                    backgroundColor: '#09090b',
                    color: '#38bdf8',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    display: 'inline-block',
                    border: '1px solid #27272a',
                  }}
                >
                  {item.runId}
                </code>
              </td>

              {/* Proyecto */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: '500', color: '#f3f4f6' }}>
                {item.projectName || 'Sin Proyecto'}
              </td>

              {/* URL Objetivo (Nuevo Campo) */}
              <td style={{ padding: '12px 16px' }}>
                {item.targetUrl ? (
                  <a
                    href={item.targetUrl.startsWith('http') ? item.targetUrl : `https://${item.targetUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#34d399', textDecoration: 'none', wordBreak: 'break-all', fontWeight: '500' }}
                  >
                    {item.targetUrl}
                  </a>
                ) : (
                  <span style={{ color: '#6b7280' }}>-</span>
                )}
              </td>

              {/* Suite / Módulo */}
              <td style={{ padding: '12px 16px', color: '#fcd34d' }}>
                {item.suiteName || 'Suite Estándar'}
              </td>

              {/* Fecha */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#9ca3af' }}>
                {item.startedAt ? new Date(item.startedAt).toLocaleString() : 'N/A'}
              </td>

              {/* Estado */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    background: item.status === 'COMPLETED' ? '#059669' : '#d97706',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {item.status || 'PENDING'}
                </span>
              </td>

              {/* Hallazgos */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    background: item.totalFindings > 0 ? '#ef4444' : '#10b981',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    display: 'inline-block',
                  }}
                >
                  {item.totalFindings} {item.auditType === 'NETWORK_AUDIT' ? 'Abiertos' : 'Detectados'}
                </span>
              </td>

              {/* Acción */}
              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                <button
                  onClick={() => onOpenReportModal(item)}
                  style={{
                    background: '#2563eb',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  👁️ Ver Reporte
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};