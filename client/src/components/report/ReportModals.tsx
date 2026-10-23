import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  useEffect(() => {
    if (selectedEvidenceModal || selectedFinding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedEvidenceModal, selectedFinding]);

  if (!selectedEvidenceModal && !selectedFinding) return null;

  const modalJSX = (
    <>
      {/* MODAL DE EVIDENCIA COMPLETA */}
      {selectedEvidenceModal && (
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
          onClick={onCloseEvidenceModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 9, 11, 0.98) 100%)',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 28px',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.25)',
              color: '#fff',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* CABECERA DEL MODAL CON SEPARACIÓN ESTRICTA DEL BOTÓN DE CIERRE */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
                paddingBottom: '14px',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: '4px',
                    color: '#38bdf8',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 'bold',
                  }}
                >
                  <span>🔎</span> Evidencia Técnica Completa
                </h3>
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    display: 'inline-block',
                    backgroundColor: 'rgba(2, 6, 23, 0.6)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(30, 41, 59, 0.8)',
                  }}
                >
                  {selectedEvidenceModal.title}
                </span>
              </div>

              <button
                type="button"
                onClick={onCloseEvidenceModal}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden', marginTop: '14px' }}>
              <pre
                style={{
                  background: '#09090b',
                  color: '#38bdf8',
                  padding: '16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  lineHeight: '1.6',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                  boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)',
                  margin: 0,
                }}
              >
                {selectedEvidenceModal.evidenceText}
              </pre>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={onCloseEvidenceModal}
                style={{
                  padding: '8px 20px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INSPECCIÓN PROFUNDA */}
      {selectedFinding && (
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
          onClick={onCloseFindingModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(9, 9, 11, 0.98) 100%)',
              width: '100%',
              maxWidth: '780px',
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
              onClick={onCloseFindingModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px', paddingRight: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold' }}>AUDIT DIAGNOSTIC PANEL</span>
              </div>
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 0,
                  color: '#ffffff',
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                📋 Informe Técnico Extendido del Hallazgo
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🕒 Hora de Ejecución
                </span>
                <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: '600' }}>
                  {selectedFinding.findingTime ? new Date(selectedFinding.findingTime).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🛡️ Módulo Ejecutado
                </span>
                <span style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: '700' }}>
                  {selectedFinding.moduleName || 'Header & TLS Audit'}
                </span>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  ⚡ Estado de Ejecución
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #22c55e' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  {selectedFinding.runStatus || 'COMPLETED'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🌐 URL Específica Evaluada
                </span>
                <a
                  href={selectedFinding.targetUrl || currentTargetUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '0.92rem', fontWeight: '600', wordBreak: 'break-all' }}
                >
                  {selectedFinding.targetUrl || currentTargetUrl}
                </a>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🎯 Nombre del Hallazgo / Suite
                </span>
                <span style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700' }}>
                  {selectedFinding.suiteName || selectedFinding.title}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(250, 204, 21, 0.3)', marginBottom: '16px' }}>
              <span style={{ color: '#facc15', fontSize: '0.78rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                🤖 Prompt Gemini AI Aplicado:
              </span>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: '1.5' }}>
                "{selectedFinding.promptInput || 'Análisis de seguridad web OWASP estándar.'}"
              </p>
            </div>

            {Boolean(selectedFinding.rawPayload) && (
              <div style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>
                  📦 Raw Payload Registrado:
                </strong>
                <pre
                  style={{
                    background: '#09090b',
                    color: '#38bdf8',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid #27272a',
                    margin: 0,
                  }}
                >
                  {typeof selectedFinding.rawPayload === 'object' && selectedFinding.rawPayload !== null
                    ? JSON.stringify(selectedFinding.rawPayload, null, 2)
                    : String(selectedFinding.rawPayload)}
                </pre>
              </div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'right', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={onCloseFindingModal}
                style={{
                  padding: '8px 20px',
                  background: 'rgba(2, 132, 199, 0.85)',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(modalJSX, document.body);
};