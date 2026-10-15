import React from 'react';
import type { FindingDetail } from './report.types';

interface ReportModalsProps {
  selectedEvidenceModal: { title: string; evidenceText: string } | null;
  selectedFinding: FindingDetail | null;
  currentTargetUrl: string;
  onCloseEvidenceModal: () => void;
  onCloseFindingModal: () => void;
}

export const ReportModals: React.FC<ReportModalsProps> = ({
  selectedEvidenceModal,
  selectedFinding,
  currentTargetUrl,
  onCloseEvidenceModal,
  onCloseFindingModal,
}) => {
  return (
    <>
      {/* MODAL DE EVIDENCIA COMPLETA */}
      {selectedEvidenceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#18181b', width: '95%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '8px', border: '1px solid #3f3f46', color: '#fff', position: 'relative' }}>
            <button
              onClick={onCloseEvidenceModal}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0, color: '#f59e0b', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              🔎 Evidencia Técnica Completa - {selectedEvidenceModal.title}
            </h3>
            <div style={{ flex: 1, overflow: 'hidden', marginTop: '10px' }}>
              <pre style={{
                background: '#09090b',
                color: '#f43f5e',
                padding: '16px',
                borderRadius: '6px',
                fontSize: '12px',
                lineHeight: '1.5',
                border: '1px solid #3f3f46',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '55vh',
                overflowY: 'auto',
                fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
              }}>
                {selectedEvidenceModal.evidenceText}
              </pre>
            </div>
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button
                onClick={onCloseEvidenceModal}
                style={{ padding: '8px 18px', background: '#3f3f46', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INSPECCIÓN PROFUNDA */}
      {selectedFinding && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#18181b', width: '90%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '8px', border: '1px solid #3f3f46', color: '#fff', position: 'relative' }}>
            <button
              onClick={onCloseFindingModal}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <h2 style={{ marginTop: 0, color: '#60a5fa', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
              📋 Informe Técnico Extendido del Hallazgo
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '14px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '8px', color: '#9ca3af', fontWeight: 'bold', width: '35%' }}>1. Hora del Test:</td>
                  <td style={{ padding: '8px', color: '#e5e7eb' }}>{selectedFinding.findingTime ? new Date(selectedFinding.findingTime).toLocaleString() : new Date().toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '8px', color: '#9ca3af', fontWeight: 'bold' }}>2. URL Específica:</td>
                  <td style={{ padding: '8px', color: '#38bdf8', wordBreak: 'break-all' }}>
                    <a href={selectedFinding.targetUrl || currentTargetUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                      {selectedFinding.targetUrl || currentTargetUrl}
                    </a>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '8px', color: '#9ca3af', fontWeight: 'bold' }}>3. Nombre Suite:</td>
                  <td style={{ padding: '8px', color: '#e5e7eb' }}>{selectedFinding.suiteName || selectedFinding.title}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '8px', color: '#9ca3af', fontWeight: 'bold' }}>4. Prompt Gemini AI:</td>
                  <td style={{ padding: '8px', color: '#fcd34d', fontStyle: 'italic' }}>
                    {selectedFinding.promptInput || 'Análisis de seguridad web OWASP estándar.'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '8px', color: '#9ca3af', fontWeight: 'bold' }}>5. Estado Ejecución:</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {selectedFinding.runStatus || 'COMPLETED'}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '8px', color: '#9ca3af', fontWeight: 'bold' }}>Módulo Ejecutado:</td>
                  <td style={{ padding: '8px', color: '#e5e7eb' }}>{selectedFinding.moduleName || 'Seguridad Web'}</td>
                </tr>
              </tbody>
            </table>

            {Boolean(selectedFinding.rawPayload) && (
              <div style={{ marginTop: '16px' }}>
                <strong style={{ color: '#9ca3af', display: 'block', marginBottom: '6px' }}>📦 Raw Payload:</strong>
                <pre style={{ background: '#09090b', color: '#a1a1aa', padding: '12px', borderRadius: '6px', fontSize: '11px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #27272a' }}>
                  {typeof selectedFinding.rawPayload === 'object' && selectedFinding.rawPayload !== null
                    ? JSON.stringify(selectedFinding.rawPayload, null, 2)
                    : String(selectedFinding.rawPayload)}
                </pre>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={onCloseFindingModal}
                style={{ padding: '8px 16px', background: '#3f3f46', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};