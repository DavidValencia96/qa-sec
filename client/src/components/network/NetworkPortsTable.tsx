import React from 'react';

export interface ServiceItem {
  port: number;
  service: string;
  status: 'OPEN' | 'CLOSED';
}

interface NetworkPortsTableProps {
  services: ServiceItem[];
}

export const NetworkPortsTable: React.FC<NetworkPortsTableProps> = ({ services }) => {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <thead>
          <tr style={{ background: 'rgba(30, 41, 59, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#cbd5e1' }}>
            <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Puerto</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Servicio</th>
            <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Estado Real Verificado</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 'bold' }}>
                {s.port}/TCP
              </td>
              <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: '500' }}>
                {s.service}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <span
                  style={{
                    background: s.status === 'OPEN' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(22, 101, 52, 0.2)',
                    color: s.status === 'OPEN' ? '#f87171' : '#4ade80',
                    border: `1px solid ${s.status === 'OPEN' ? '#ef4444' : '#22c55e'}`,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: s.status === 'OPEN' ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                  }}
                >
                  {s.status === 'OPEN' ? '🔴 ABIERTO (Peligro Exposición)' : '🟢 CERRADO (Seguro)'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};