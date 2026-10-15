import React from 'react';

interface NetworkMetricsProps {
  total: number;
  openCount: number;
  closedCount: number;
}

export const NetworkMetrics: React.FC<NetworkMetricsProps> = ({ total, openCount, closedCount }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
      <div style={{ background: '#09090b', padding: '12px', borderRadius: '6px', border: '1px solid #27272a' }}>
        <span style={{ color: '#9ca3af', fontSize: '12px', display: 'block' }}>Total Verificados</span>
        <strong style={{ fontSize: '20px', color: '#fff' }}>{total} Puertos</strong>
      </div>
      <div style={{ background: '#064e3b', padding: '12px', borderRadius: '6px', border: '1px solid #059669' }}>
        <span style={{ color: '#a7f3d0', fontSize: '12px', display: 'block' }}>Puertos Abiertos (Riesgo)</span>
        <strong style={{ fontSize: '20px', color: '#34d399' }}>{openCount}</strong>
      </div>
      <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', border: '1px solid #334155' }}>
        <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block' }}>Puertos Cerrados (Protegidos)</span>
        <strong style={{ fontSize: '20px', color: '#38bdf8' }}>{closedCount}</strong>
      </div>
    </div>
  );
};