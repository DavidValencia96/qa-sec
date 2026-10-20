import React from 'react';

interface NetworkMetricsProps {
  total: number;
  openCount: number;
  closedCount: number;
}

export const NetworkMetrics: React.FC<NetworkMetricsProps> = ({ total, openCount, closedCount }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* TOTAL VERIFICADOS */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 20px',
          borderRadius: '8px',
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Total Verificados
        </span>
        <strong style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: '800' }}>
          {total} <span style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 'normal' }}>Puertos</span>
        </strong>
      </div>

      {/* PUERTOS ABIERTOS */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%)',
          border: '1px solid #ef4444',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)',
        }}
      >
        <span style={{ color: '#f87171', fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Puertos Abiertos (Riesgo)
        </span>
        <strong style={{ fontSize: '1.6rem', color: '#f87171', fontWeight: '800' }}>
          {openCount}
        </strong>
      </div>

      {/* PUERTOS CERRADOS */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%)',
          border: '1px solid #22c55e',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 0 15px rgba(34, 197, 94, 0.15)',
        }}
      >
        <span style={{ color: '#4ade80', fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Puertos Cerrados (Protegidos)
        </span>
        <strong style={{ fontSize: '1.6rem', color: '#4ade80', fontWeight: '800' }}>
          {closedCount}
        </strong>
      </div>
    </div>
  );
};