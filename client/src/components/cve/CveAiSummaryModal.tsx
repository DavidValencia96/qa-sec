import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  useEffect(() => {
    if (cveId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [cveId]);

  if (!cveId) return null;

  const modalJSX = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(9, 9, 11, 0.98) 100%)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 0 40px rgba(56, 189, 248, 0.25)',
          color: '#fff',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            AI THREAT INTELLIGENCE DIAGNOSTIC
          </span>
          <h3 style={{ margin: '4px 0 0 0', color: '#ffffff', fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🤖 Diagnóstico IA: {cveId}
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '36px 0', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span>
            <p style={{ color: '#38bdf8', fontWeight: 'bold', marginTop: '12px', fontSize: '0.92rem' }}>
              Consultando a Gemini AI para traducir y analizar impacto...
            </p>
          </div>
        ) : analysis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* RESUMEN */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <strong style={{ color: '#38bdf8', fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
                📝 Resumen (Español):
              </strong>
              <p style={{ margin: 0, color: '#e4e4e7', fontSize: '0.9rem', lineHeight: '1.6' }}>{analysis.summaryEs}</p>
            </div>

            {/* IMPACTO ESTIMADO */}
            <div style={{ background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <strong style={{ color: '#f87171', fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
                💥 Impacto Estimado:
              </strong>
              <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.9rem', lineHeight: '1.6' }}>{analysis.impactLevel}</p>
            </div>

            {/* MITIGACIÓN */}
            <div style={{ background: 'rgba(6, 78, 59, 0.25)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <strong style={{ color: '#4ade80', fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                🛠️ Pasos de Mitigación:
              </strong>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#86efac', fontSize: '0.88rem', lineHeight: '1.6' }}>
                {analysis.mitigationSteps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p style={{ color: '#f87171', textAlign: 'center', padding: '20px 0' }}>⚠️ No se pudo obtener el análisis para este CVE.</p>
        )}

        <div style={{ marginTop: '24px', textAlign: 'right', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
};