import React, { useState } from 'react';
import type { LoadTestHistoryItem } from '../../services/api.client';
import { LoadTestMetricsCard } from '../loadTest/LoadTestMetricsCard';

interface LoadTestHistoryTableProps {
  items: LoadTestHistoryItem[];
  onSelectResult?: (item: LoadTestHistoryItem) => void;
  onExportSingleRecord?: (item: LoadTestHistoryItem) => void;
}

const renderTesterBadge = (email?: string) => {
  const isGuest = !email || email.toLowerCase() === 'visitante';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '5px',
        fontSize: '11px',
        fontFamily: isGuest ? 'sans-serif' : 'monospace',
        fontWeight: 600,
        backgroundColor: isGuest ? 'rgba(100, 116, 139, 0.15)' : 'rgba(2, 132, 199, 0.2)',
        color: isGuest ? '#94a3b8' : '#38bdf8',
        border: `1px solid ${isGuest ? 'rgba(148, 163, 184, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{isGuest ? '👤' : '✉️'}</span>
      <span>{isGuest ? 'visitante' : email}</span>
    </span>
  );
};

export const LoadTestHistoryTable: React.FC<LoadTestHistoryTableProps> = ({
  items,
  onExportSingleRecord,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
        📜 No hay registros de pruebas de carga guardados en MySQL.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '22%' }}>Endpoint</th>
            <th style={{ padding: '14px 16px', width: '8%' }}>Método</th>
            <th style={{ padding: '14px 16px', width: '10%' }}>Concurrencia</th>
            <th style={{ padding: '14px 16px', width: '8%' }}>RPS</th>
            <th style={{ padding: '14px 16px', width: '10%' }}>Latencia Media</th>
            <th style={{ padding: '14px 16px', width: '14%' }}>Protección Rate Limit</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Tester</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '14%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const protectionColor =
              item.aiDiagnosis?.rateLimitingProtection === 'EXCELLENT'
                ? '#34d399'
                : item.aiDiagnosis?.rateLimitingProtection === 'WEAK'
                ? '#facc15'
                : '#f87171';

            return (
              <React.Fragment key={item.id}>
                <tr
                  style={{
                    borderBottom: isExpanded ? 'none' : '1px solid rgba(30, 41, 59, 0.6)',
                    backgroundColor: isExpanded ? 'rgba(30, 41, 59, 0.4)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc' }}>
                    {item.targetUrl}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        backgroundColor: '#020617',
                        border: '1px solid rgba(51, 65, 85, 0.8)',
                        color: '#38bdf8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.method}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                    {item.concurrency} clientes
                  </td>

                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#c084fc' }}>
                    {item.rps} req/s
                  </td>

                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#fde047' }}>
                    {item.avgLatencyMs} ms
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: protectionColor, fontWeight: 'bold', fontSize: '12px' }}>
                      {item.aiDiagnosis?.rateLimitingProtection || item.rateLimitProtection}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleString('es-ES')}
                  </td>

                  {/* Columna Tester */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {renderTesterBadge(item.testerEmail)}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                      {onExportSingleRecord && (
                        <button
                          type="button"
                          onClick={() => onExportSingleRecord(item)}
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(52, 211, 153, 0.4)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          📥 Exportar PDF/HTML
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleRow(item.id)}
                        style={{
                          backgroundColor: isExpanded ? '#0284c7' : 'rgba(2, 132, 199, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(56, 189, 248, 0.5)',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: isExpanded ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isExpanded ? '✕ Ocultar' : '👁️ Ver Métricas'}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* FILA DESPLEGABLE */}
                {isExpanded && (
                  <tr style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.8)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
                    <td colSpan={9} style={{ padding: '20px' }}>
                      <div
                        style={{
                          backgroundColor: '#090d16',
                          border: '1px solid #0284c7',
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: '0 0 25px rgba(2, 132, 199, 0.3)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '15px', color: '#38bdf8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🎯</span> Detalle de Prueba de Estrés: <span style={{ color: '#f8fafc' }}>{item.targetUrl}</span>
                          </h3>
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#ef4444',
                              padding: '4px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            ✕ Cerrar Detalle
                          </button>
                        </div>

                        <LoadTestMetricsCard
                          result={{
                            runId: item.id,
                            config: {
                              targetUrl: item.targetUrl,
                              method: item.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
                              concurrency: item.concurrency,
                              durationSeconds: item.durationSeconds,
                            },
                            metrics: item.metrics,
                            aiDiagnosis: item.aiDiagnosis,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LoadTestHistoryTable;