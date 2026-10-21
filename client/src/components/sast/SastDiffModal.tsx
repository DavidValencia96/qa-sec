import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
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

        <div style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            SECURE REFACTORING AI DIAGNOSTIC
          </span>
          <h3 style={{ margin: '4px 0 0 0', color: '#ffffff', fontSize: '1.3rem', fontWeight: '800' }}>
            ✨ Propuesta de Refactorización Segura — <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{fileName}</span>
          </h3>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: 0, marginBottom: '16px', lineHeight: '1.5' }}>
          Este código ha sido reconstruido por Gemini AI resolviendo credenciales hardcodeadas, sanitizando variables de entorno y corrigiendo vulnerabilidades OWASP identificadas.
        </p>

        <pre
          style={{
            flex: 1,
            background: '#09090b',
            padding: '18px',
            borderRadius: '10px',
            color: '#86efac',
            fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            overflow: 'auto',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)',
            margin: 0,
          }}
        >
          {remediatedCode}
        </pre>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
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
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
};