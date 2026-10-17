import React from 'react';
import type { SastHistoryItem } from '../../services/api.client';
import { ReportExportActions } from '../report/ReportExportActions';

interface SastHistoryTableProps {
  items: SastHistoryItem[];
  onSelectAudit: (item: SastHistoryItem) => void;
}

export const SastHistoryTable: React.FC<SastHistoryTableProps> = ({ items, onSelectAudit }) => {
  if (items.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
        📜 No hay registros de auditorías SAST guardados en MySQL.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#18181b', borderRadius: '8px', overflow: 'hidden', border: '1px solid #27272a' }}>
        <thead>
          <tr style={{ background: '#27272a', color: '#38bdf8', fontSize: '0.85rem' }}>
            <th style={{ padding: '12px 16px' }}>Archivo Auditado</th>
            <th style={{ padding: '12px 16px' }}>Tipo</th>
            <th style={{ padding: '12px 16px' }}>Salud</th>
            <th style={{ padding: '12px 16px' }}>Hallazgos</th>
            <th style={{ padding: '12px 16px' }}>Fecha</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const scoreColor = item.healthScore >= 80 ? '#22c55e' : item.healthScore >= 50 ? '#eab308' : '#ef4444';
            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #27272a', fontSize: '0.85rem', color: '#f4f4f5' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>📄 {item.fileName}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#09090b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #3f3f46' }}>
                    {item.fileType}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold', color: scoreColor }}>
                  {item.healthScore} / 100
                </td>
                <td style={{ padding: '12px 16px' }}>{item.totalFindings} hallazgos</td>
                <td style={{ padding: '12px 16px', color: '#a1a1aa' }}>
                  {new Date(item.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <ReportExportActions
                      title={`Auditoría SAST - ${item.fileName}`}
                      summary={`Auditoría estática realizada el ${new Date(item.createdAt).toLocaleDateString()} con un puntaje de salud de ${item.healthScore}/100 y ${item.totalFindings} hallazgos.`}
                      score={item.healthScore}
                      findings={item.findings}
                      remediatedCode={item.remediatedCode}
                    />
                    <button
                      type="button"
                      onClick={() => onSelectAudit(item)}
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      👁️ Detalle
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};