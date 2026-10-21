import React from 'react';
import type { LoadTestResult } from './loadTest.types';

interface LoadTestMetricsCardProps {
  result: LoadTestResult;
}

export const LoadTestMetricsCard: React.FC<LoadTestMetricsCardProps> = ({ result }) => {
  const { metrics, aiDiagnosis } = result;

  const getProtectionBadge = (protectionLevel: string) => {
    const level = (protectionLevel || '').toUpperCase();
    if (level === 'EXCELLENT' || level === 'STABLE') {
      return {
        label: `PROTECCIÓN: ${level}`,
        bg: 'rgba(34, 197, 94, 0.2)',
        color: '#4ade80',
        border: '#22c55e',
      };
    } else if (level === 'WEAK') {
      return {
        label: `PROTECCIÓN: ${level}`,
        bg: 'rgba(234, 179, 8, 0.2)',
        color: '#facc15',
        border: '#eab308',
      };
    } else {
      return {
        label: `PROTECCIÓN: ${level || 'CRITICAL'}`,
        bg: 'rgba(239, 68, 68, 0.2)',
        color: '#f87171',
        border: '#ef4444',
      };
    }
  };

  const badge = getProtectionBadge(aiDiagnosis.rateLimitingProtection);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Diagnóstico Ejecutivo de IA */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
          padding: '20px 24px',
          borderRadius: '10px',
          border: `1px solid ${badge.border}`,
          boxShadow: '0 0 20px rgba(129, 140, 248, 0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#a5b4fc',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🤖 Diagnóstico de Resiliencia IA (Gemini)
          </h3>
          <span
            style={{
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
              fontWeight: 'bold',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
            }}
          >
            {badge.label}
          </span>
        </div>

        <p style={{ color: '#e2e8f0', margin: '0 0 16px 0', fontSize: '0.92rem', lineHeight: '1.6' }}>
          {aiDiagnosis.summary}
        </p>

        <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '0.88rem' }}>
          💡 Recomendaciones Defensivas:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6' }}>
          {aiDiagnosis.recommendations.map((rec, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Métricas Principales de Estrés */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Total Peticiones
          </span>
          <h2 style={{ margin: '6px 0 0 0', color: '#ffffff', fontSize: '1.6rem', fontWeight: '800' }}>
            {metrics.totalRequests}
          </h2>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #38bdf8',
            textAlign: 'center',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Peticiones / Seg (RPS)
          </span>
          <h2 style={{ margin: '6px 0 0 0', color: '#38bdf8', fontSize: '1.6rem', fontWeight: '800' }}>
            {metrics.requestsPerSecond} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>req/s</span>
          </h2>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Latencia Media
          </span>
          <h2 style={{ margin: '6px 0 0 0', color: '#facc15', fontSize: '1.6rem', fontWeight: '800' }}>
            {metrics.avgLatencyMs} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ms</span>
          </h2>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Latencia p95
          </span>
          <h2 style={{ margin: '6px 0 0 0', color: '#fb923c', fontSize: '1.6rem', fontWeight: '800' }}>
            {metrics.p95LatencyMs} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ms</span>
          </h2>
        </div>
      </div>

      {/* Desglose de Respuestas HTTP */}
      <div
        style={{
          background: 'rgba(9, 9, 11, 0.6)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        <h4 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '0.95rem' }}>
          📊 Desglose de Respuestas HTTP Servidor
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <div
            style={{
              background: 'rgba(22, 101, 52, 0.2)',
              padding: '12px',
              borderRadius: '0 6px 6px 0',
              borderLeft: '4px solid #22c55e',
            }}
          >
            <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>
              2xx Exitosas
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>
              {metrics.statusBreakdown.status2xx}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(2, 132, 199, 0.2)',
              padding: '12px',
              borderRadius: '0 6px 6px 0',
              borderLeft: '4px solid #38bdf8',
            }}
          >
            <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>
              429 Rate Limited
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>
              {metrics.statusBreakdown.status429RateLimited}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(202, 138, 4, 0.2)',
              padding: '12px',
              borderRadius: '0 6px 6px 0',
              borderLeft: '4px solid #facc15',
            }}
          >
            <span style={{ color: '#facc15', fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>
              4xx Errores Cliente
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#facc15', marginTop: '4px' }}>
              {metrics.statusBreakdown.status4xx}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(220, 38, 38, 0.2)',
              padding: '12px',
              borderRadius: '0 6px 6px 0',
              borderLeft: '4px solid #ef4444',
            }}
          >
            <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>
              5xx Caídas Servidor
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>
              {metrics.statusBreakdown.status5xx}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(107, 114, 128, 0.2)',
              padding: '12px',
              borderRadius: '0 6px 6px 0',
              borderLeft: '4px solid #9ca3af',
            }}
          >
            <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>
              Timeouts
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#9ca3af', marginTop: '4px' }}>
              {metrics.statusBreakdown.timeouts}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};