import React from 'react';

interface SastDiffModalProps {
  remediatedCode: string;
  fileName: string;
  onClose: () => void;
}

export const SastDiffModal: React.FC<SastDiffModalProps> = ({
  remediatedCode,
  fileName,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#18181b',
          border: '1px solid #38bdf8',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#38bdf8' }}>✨ Propuesta de Refactorización Segura — {fileName}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: 0 }}>
          Este código ha sido reconstruido por Gemini AI resolviendo las credenciales hardcodeadas y corrigiendo vulnerabilidades OWASP identificadas.
        </p>

        <pre
          style={{
            flex: 1,
            background: '#09090b',
            padding: '16px',
            borderRadius: '6px',
            color: '#86efac',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            overflow: 'auto',
            border: '1px solid #27272a',
          }}
        >
          {remediatedCode}
        </pre>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};