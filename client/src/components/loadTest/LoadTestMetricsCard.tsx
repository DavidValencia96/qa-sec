import React from 'react';
import type { LoadTestResult } from './loadTest.types';

interface LoadTestMetricsCardProps {
  result: LoadTestResult;
}

export const LoadTestMetricsCard: React.FC<LoadTestMetricsCardProps> = ({ result }) => {
  const { metrics, aiDiagnosis } = result;

  const protectionColor =
    aiDiagnosis.rateLimitingProtection === 'EXCELLENT'
      ? '#22c55e'
      : aiDiagnosis.rateLimitingProtection === 'WEAK'
      ? '#eab308'
      : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Diagnóstico Ejecutivo de IA */}
      <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: `1px solid ${protectionColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#f4f4f5' }}>🤖 Diagnóstico de Resiliencia IA (Gemini)</h3>
          <span style={{ background: protectionColor, color: '#000', fontWeight: 'bold', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
            PROTECCIÓN: {aiDiagnosis.rateLimitingProtection}
          </span>
        </div>
        <p style={{ color: '#d4d4d8', margin: '0 0 16px 0', fontSize: '0.95rem' }}>{aiDiagnosis.summary}</p>

        <h4 style={{ color: '#38bdf8', margin: '0 0 8px 0', fontSize: '0.9rem' }}>💡 Recomendaciones Defensivas:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', fontSize: '0.85rem' }}>
          {aiDiagnosis.recommendations.map((rec, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Métricas Principales de Estrés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Total Peticiones</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#38bdf8' }}>{metrics.totalRequests}</h2>
        </div>

        <div style={{ background: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Peticiones / Seg (RPS)</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#a855f7' }}>{metrics.requestsPerSecond} req/s</h2>
        </div>

        <div style={{ background: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Latencia Media</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#facc15' }}>{metrics.avgLatencyMs} ms</h2>
        </div>

        <div style={{ background: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Latencia p95</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#f97316' }}>{metrics.p95LatencyMs} ms</h2>
        </div>
      </div>

      {/* Desglose de Respuestas HTTP */}
      <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#f4f4f5' }}>📊 Desglose de Respuestas HTTP Servidor</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
          <div style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #22c55e' }}>
            <span style={{ color: '#a1a1aa' }}>2xx Exitosas</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>{metrics.statusBreakdown.status2xx}</div>
          </div>

          <div style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #38bdf8' }}>
            <span style={{ color: '#a1a1aa' }}>429 Rate Limited</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>{metrics.statusBreakdown.status429RateLimited}</div>
          </div>

          <div style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #eab308' }}>
            <span style={{ color: '#a1a1aa' }}>4xx Errores Cliente</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#eab308' }}>{metrics.statusBreakdown.status4xx}</div>
          </div>

          <div style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
            <span style={{ color: '#a1a1aa' }}>5xx Caídas Servidor</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>{metrics.statusBreakdown.status5xx}</div>
          </div>

          <div style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #a855f7' }}>
            <span style={{ color: '#a1a1aa' }}>Timeouts</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7' }}>{metrics.statusBreakdown.timeouts}</div>
          </div>
        </div>
      </div>
    </div>
  );
};