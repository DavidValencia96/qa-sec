import React, { useState } from 'react';
import { exportReportApi } from '../../services/api.client';

interface ReportExportActionsProps {
  title: string;
  targetUrl?: string;
  summary: string;
  score?: number;
  findings: Array<{
    title: string;
    severity: string;
    description: string;
    recommendation?: string;
    evidence?: string;
  }>;
  remediatedCode?: string;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({
  title,
  targetUrl,
  summary,
  score,
  findings,
  remediatedCode,
}) => {
  const [downloading, setDownloading] = useState<boolean>(false);

  const handleExport = async (format: 'html' | 'markdown') => {
    setDownloading(true);
    try {
      await exportReportApi({
        title,
        targetUrl,
        summary,
        score,
        findings,
        remediatedCode,
        format,
      });
    } catch (err) {
      alert(`Error al exportar el reporte: ${(err as Error).message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button
        type="button"
        disabled={downloading}
        onClick={() => handleExport('html')}
        style={{
          background: '#0284c7',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 14px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          cursor: downloading ? 'not-allowed' : 'pointer',
        }}
      >
        📥 Exportar HTML
      </button>

      <button
        type="button"
        disabled={downloading}
        onClick={() => handleExport('markdown')}
        style={{
          background: '#27272a',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '8px 14px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          cursor: downloading ? 'not-allowed' : 'pointer',
        }}
      >
        📝 Exportar Markdown
      </button>
    </div>
  );
};