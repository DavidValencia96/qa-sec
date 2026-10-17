import React from 'react';
import type { LoadTestHistoryItem } from '../../services/api.client';

interface LoadTestHistoryTableProps {
  items: LoadTestHistoryItem[];
  onSelectResult: (item: LoadTestHistoryItem) => void;
}

export const LoadTestHistoryTable: React.FC<LoadTestHistoryTableProps> = ({ items, onSelectResult }) => {
  if (items.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
        📜 No hay registros de pruebas de carga guardados en MySQL.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
        <thead>
          <tr style={{ background: '#27272a', color: '#38bdf8', fontSize: '0.85rem' }}>
            <th style={{ padding: '12px 16px' }}>Endpoint</th>
            <th style={{ padding: '12px 16px' }}>Método</th>
            <th style={{ padding: '12px 16px' }}>Concurrencia</th>
            <th style={{ padding: '12px 16px' }}>RPS</th>
            <th style={{ padding: '12px 16px' }}>Latencia Media</th>
            <th style={{ padding: '12px 16px' }}>Protección Rate Limit</th>
            <th style={{ padding: '12px 16px' }}>Fecha</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const protectionColor =
              item.aiDiagnosis?.rateLimitingProtection === 'EXCELLENT'
                ? '#22c55e'
                : item.aiDiagnosis?.rateLimitingProtection === 'WEAK'
                ? '#eab308'
                : '#ef4444';

            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #27272a', fontSize: '0.85rem', color: '#f4f4f5' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{item.targetUrl}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#09090b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #3f3f46' }}>
                    {item.method}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{item.concurrency} clientes</td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#a855f7' }}>{item.rps} req/s</td>
                <td style={{ padding: '12px 16px', color: '#facc15' }}>{item.avgLatencyMs} ms</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: protectionColor, fontWeight: 'bold' }}>
                    {item.aiDiagnosis?.rateLimitingProtection || item.rateLimitProtection}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#a1a1aa' }}>
                  {new Date(item.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => onSelectResult(item)}
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
                    👁️ Ver Métricas
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