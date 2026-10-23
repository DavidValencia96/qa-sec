import React, { useState } from 'react';
import type { HistoryItem } from './history.types';

interface HistoryTableProps {
  items: HistoryItem[];
  onOpenReportModal: (item: HistoryItem) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ items, onOpenReportModal }) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (!items || items.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: '#94a3b8',
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(30, 41, 59, 0.8)',
          fontSize: '13px',
        }}
      >
        📜 No se encontraron reportes en la base de datos.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '8%', whiteSpace: 'nowrap' }}>Tipo</th>
            <th style={{ padding: '14px 16px', width: '18%', whiteSpace: 'nowrap' }}>ID Ejecución</th>
            <th style={{ padding: '14px 16px', width: '16%', whiteSpace: 'nowrap' }}>Proyecto</th>
            <th style={{ padding: '14px 16px', width: '22%', whiteSpace: 'nowrap' }}>URL Objetivo</th>
            <th style={{ padding: '14px 16px', width: '18%', whiteSpace: 'nowrap' }}>Suite / Módulo</th>
            <th style={{ padding: '14px 16px', width: '10%', whiteSpace: 'nowrap' }}>Fecha</th>
            <th style={{ padding: '14px 16px', width: '10%', whiteSpace: 'nowrap' }}>Estado</th>
            <th style={{ padding: '14px 16px', width: '10%', whiteSpace: 'nowrap' }}>Hallazgos</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '12%', whiteSpace: 'nowrap' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isHovered = hoveredRow === item.runId;
            const totalFindings = item.totalFindings || 0;
            const isCompleted = item.status === 'COMPLETED' || item.status === 'FINISHED' || !item.status;
            const isNetwork = item.auditType === 'NETWORK_AUDIT';

            return (
              <tr
                key={item.runId}
                onMouseEnter={() => setHoveredRow(item.runId)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderBottom: '1px solid rgba(30, 41, 59, 0.6)',
                  backgroundColor: isHovered ? 'rgba(30, 41, 59, 0.35)' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Tipo */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      backgroundColor: isNetwork ? 'rgba(49, 46, 129, 0.4)' : 'rgba(2, 132, 199, 0.2)',
                      border: `1px solid ${isNetwork ? 'rgba(99, 102, 241, 0.5)' : 'rgba(56, 189, 248, 0.4)'}`,
                      color: isNetwork ? '#a5b4fc' : '#38bdf8',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    {isNetwork ? '🌐 Red' : '💻 Web'}
                  </span>
                </td>

                {/* ID Ejecución */}
                <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                  <code
                    style={{
                      backgroundColor: '#020617',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      wordBreak: 'break-all',
                      display: 'inline-block',
                    }}
                  >
                    {item.runId}
                  </code>
                </td>

                {/* Proyecto */}
                <td style={{ padding: '14px 16px', color: '#cbd5e1', fontWeight: '500', whiteSpace: 'nowrap' }}>
                  {item.projectName || 'Sin Proyecto'}
                </td>

                {/* URL Objetivo */}
                <td style={{ padding: '14px 16px' }}>
                  {item.targetUrl ? (
                    <a
                      href={item.targetUrl.startsWith('http') ? item.targetUrl : `https://${item.targetUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#34d399', textDecoration: 'none', fontWeight: 'bold', wordBreak: 'break-all' }}
                    >
                      {item.targetUrl}
                    </a>
                  ) : (
                    <span style={{ color: '#64748b' }}>-</span>
                  )}
                </td>

                {/* Suite / Módulo */}
                <td style={{ padding: '14px 16px', color: '#facc15', fontWeight: '600' }}>
                  {item.suiteName || 'Suite Estándar'}
                </td>

                {/* Fecha */}
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {item.startedAt ? new Date(item.startedAt).toLocaleString('es-ES') : 'N/A'}
                </td>

                {/* Estado */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      backgroundColor: isCompleted ? 'rgba(6, 78, 59, 0.4)' : 'rgba(127, 29, 29, 0.4)',
                      border: `1px solid ${isCompleted ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                      color: isCompleted ? '#34d399' : '#f87171',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    {isCompleted ? 'COMPLETED' : item.status || 'PENDING'}
                  </span>
                </td>

                {/* Hallazgos */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      backgroundColor: totalFindings > 0 ? 'rgba(127, 29, 29, 0.4)' : 'rgba(6, 78, 59, 0.4)',
                      border: `1px solid ${totalFindings > 0 ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                      color: totalFindings > 0 ? '#f87171' : '#34d399',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}
                  >
                    {totalFindings} {isNetwork ? 'Abiertos' : 'Detectados'}
                  </span>
                </td>

                {/* Acción */}
                <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={() => onOpenReportModal(item)}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: '1px solid rgba(56, 189, 248, 0.5)',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    👁️ Ver Reporte
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;