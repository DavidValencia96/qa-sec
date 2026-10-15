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
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
      <thead>
        <tr style={{ background: '#27272a', textAlign: 'left', color: '#9ca3af' }}>
          <th style={{ padding: '10px 12px' }}>Puerto</th>
          <th style={{ padding: '10px 12px' }}>Servicio</th>
          <th style={{ padding: '10px 12px' }}>Estado Real Verificado</th>
        </tr>
      </thead>
      <tbody>
        {services.map((s, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
            <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#60a5fa', fontWeight: 'bold' }}>
              {s.port}/TCP
            </td>
            <td style={{ padding: '10px 12px' }}>{s.service}</td>
            <td style={{ padding: '10px 12px' }}>
              <span
                style={{
                  background: s.status === 'OPEN' ? '#991b1b' : '#065f46',
                  color: s.status === 'OPEN' ? '#fca5a5' : '#a7f3d0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: `1px solid ${s.status === 'OPEN' ? '#ef4444' : '#10b981'}`,
                }}
              >
                {s.status === 'OPEN' ? '🔴 ABIERTO (Peligro Exposición)' : '🟢 CERRADO (Seguro)'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};