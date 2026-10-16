import React from 'react';
import type { CveAiAnalysis } from './cve.types';

interface CveAiSummaryModalProps {
  cveId: string;
  analysis: CveAiAnalysis | null;
  loading: boolean;
  onClose: () => void;
}

export const CveAiSummaryModal: React.FC<CveAiSummaryModalProps> = ({
  cveId,
  analysis,
  loading,
  onClose,
}) => {
  if (!cveId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '650px',
          padding: '24px',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#38bdf8' }}>🤖 Diagnóstico IA: {cveId}</h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#60a5fa' }}>🔄 Consultando a Gemini AI para traducir y analizar impacto...</p>
        ) : analysis ? (
          <div>
            <div style={{ marginBottom: '12px', padding: '10px', background: '#09090b', borderRadius: '6px' }}>
              <strong>📝 Resumen (Español):</strong>
              <p style={{ margin: '4px 0 0 0', color: '#e4e4e7', fontSize: '0.9rem' }}>{analysis.summaryEs}</p>
            </div>

            <div style={{ marginBottom: '12px', padding: '10px', background: '#09090b', borderRadius: '6px' }}>
              <strong>💥 Impacto Estimado:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#fca5a5', fontSize: '0.9rem' }}>{analysis.impactLevel}</p>
            </div>

            <div style={{ padding: '10px', background: '#09090b', borderRadius: '6px' }}>
              <strong>🛠️ Pasos de Mitigación:</strong>
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', color: '#86efac', fontSize: '0.85rem' }}>
                {analysis.mitigationSteps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p style={{ color: '#f87171' }}>⚠️ No se pudo obtener el análisis para este CVE.</p>
        )}
      </div>
    </div>
  );
};