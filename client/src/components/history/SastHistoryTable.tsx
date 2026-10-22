import React from 'react';
import type { SastHistoryItem } from '../../services/api.client';
import { ReportExportActions } from '../report/ReportExportActions';

interface SastHistoryTableProps {
  items: SastHistoryItem[];
  onSelectAudit: (item: SastHistoryItem) => void;
}

export const SastHistoryTable: React.FC<SastHistoryTableProps> = ({ items, onSelectAudit }) => {
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
        📜 No hay registros de auditorías SAST guardados en MySQL.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '28%' }}>Archivo Auditado</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Tipo</th>
            <th style={{ padding: '14px 16px', width: '15%' }}>Salud</th>
            <th style={{ padding: '14px 16px', width: '15%' }}>Hallazgos</th>
            <th style={{ padding: '14px 16px', width: '18%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '12%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isGood = item.healthScore >= 80;
            const isMedium = item.healthScore >= 50;

            const scoreBg = isGood ? 'rgba(6, 78, 59, 0.4)' : isMedium ? 'rgba(113, 63, 18, 0.4)' : 'rgba(127, 29, 29, 0.4)';
            const scoreBorder = isGood ? 'rgba(52, 211, 153, 0.4)' : isMedium ? 'rgba(250, 204, 21, 0.4)' : 'rgba(248, 113, 113, 0.4)';
            const scoreColor = isGood ? '#34d399' : isMedium ? '#facc15' : '#f87171';

            return (
              <tr
                key={item.id}
                style={{
                  borderBottom: '1px solid rgba(30, 41, 59, 0.6)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Archivo Auditado */}
                <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc', fontSize: '13px' }}>
                  📄 {item.fileName}
                </td>

                {/* Tipo */}
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      backgroundColor: '#020617',
                      border: '1px solid rgba(51, 65, 85, 0.8)',
                      color: '#94a3b8',
                      padding: '3px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    {item.fileType}
                  </span>
                </td>

                {/* Salud */}
                <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  <span
                    style={{
                      backgroundColor: scoreBg,
                      border: `1px solid ${scoreBorder}`,
                      color: scoreColor,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      display: 'inline-block',
                    }}
                  >
                    {item.healthScore} / 100
                  </span>
                </td>

                {/* Hallazgos */}
                <td style={{ padding: '14px 16px', fontWeight: 'bold', fontSize: '13px', color: item.totalFindings > 0 ? '#f87171' : '#34d399' }}>
                  {item.totalFindings} hallazgos
                </td>

                {/* Fecha */}
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px' }}>
                  {new Date(item.createdAt).toLocaleString('es-ES')}
                </td>

                {/* Acciones */}
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                    <ReportExportActions
                      title={`Auditoría SAST - ${item.fileName}`}
                      summary={`Auditoría estática realizada el ${new Date(item.createdAt).toLocaleDateString('es-ES')} con un puntaje de salud de ${item.healthScore}/100 y ${item.totalFindings} hallazgos.`}
                      score={item.healthScore}
                      findings={item.findings}
                      remediatedCode={item.remediatedCode}
                    />

                    <button
                      type="button"
                      onClick={() => onSelectAudit(item)}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: '1px solid rgba(56, 189, 248, 0.5)',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
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

export default SastHistoryTable;