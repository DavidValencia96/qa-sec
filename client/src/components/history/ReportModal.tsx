import React from 'react';
import { ReportViewer, type ReportData } from '../ReportViewer';

interface ReportModalProps {
  report: ReportData | null;
  targetUrl: string;
  loading: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ report, targetUrl, loading, onClose }) => {
  if (loading) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
        <div style={{ color: '#60a5fa', fontSize: '16px', fontWeight: 'bold' }}>⏳ Cargando reporte técnico...</div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
      <div style={{ background: '#121212', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '8px', border: '1px solid #3f3f46', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', zIndex: 10 }}
        >
          ✕
        </button>

        <ReportViewer report={report} currentTargetUrl={targetUrl} />

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', background: '#3f3f46', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};