import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ReportViewer, type ReportData } from '../ReportViewer';

interface ReportModalProps {
  report: ReportData | null;
  targetUrl: string;
  loading: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ report, targetUrl, loading, onClose }) => {
  // Bloquea el desplazamiento del fondo cuando el modal está activo
  useEffect(() => {
    if (loading || report) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [loading, report]);

  if (loading) {
    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
        }}
      >
        <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⏳</span> Cargando reporte técnico...
        </div>
      </div>,
      document.body
    );
  }

  if (!report) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '88vh',
          backgroundColor: '#090d16',
          border: '1px solid #0284c7',
          borderRadius: '16px',
          boxShadow: '0 0 35px rgba(2, 132, 199, 0.45)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* BOTÓN CERRAR SUPERIOR */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#ef4444',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
        >
          ✕
        </button>

        {/* VISTA INTERNA DEL REPORTE CON SCROLL INDEPENDIENTE */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          <ReportViewer report={report} currentTargetUrl={targetUrl} />
        </div>

        {/* PIE DEL MODAL CON BOTÓN DE CIERRE */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(30, 41, 59, 0.8)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;