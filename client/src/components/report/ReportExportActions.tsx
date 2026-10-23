import React, { useState } from 'react';
import { exportReportApi } from '../../services/api.client';

interface FindingItem {
  title: string;
  severity: string;
  description: string;
  recommendation?: string;
  evidence?: string;
}

interface ReportExportActionsProps {
  title: string;
  targetUrl?: string;
  summary: string;
  score?: number;
  findings: FindingItem[];
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

  const generateStyledHtml = (): string => {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Reporte de Auditoría'} - QA-Sec Suite</title>
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: #111827;
      --border-color: #1f2937;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --high-color: #ef4444;
      --medium-color: #f59e0b;
      --low-color: #3b82f6;
      --success-bg: rgba(6, 78, 59, 0.2);
      --success-border: #047857;
      --code-bg: #030712;
      --code-text: #a7f3d0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      padding: 40px 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      font-size: 22px;
      font-weight: 800;
      color: #60a5fa;
      letter-spacing: 0.5px;
    }

    .badge-secured {
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border: 1px solid #059669;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .meta-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .meta-item label {
      display: block;
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .meta-item span {
      font-size: 14px;
      font-weight: 600;
      word-break: break-all;
    }

    .executive-summary {
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .executive-summary h2 {
      margin-top: 0;
      color: #34d399;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .finding-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .finding-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
    }

    .severity-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .severity-HIGH, .severity-CRITICAL {
      background: rgba(239, 68, 68, 0.2);
      color: var(--high-color);
      border: 1px solid var(--high-color);
    }

    .severity-MEDIUM {
      background: rgba(245, 158, 11, 0.2);
      color: var(--medium-color);
      border: 1px solid var(--medium-color);
    }

    .severity-LOW {
      background: rgba(59, 130, 246, 0.2);
      color: var(--low-color);
      border: 1px solid var(--low-color);
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      margin-top: 15px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    .code-box {
      background: var(--code-bg);
      border: 1px solid var(--border-color);
      padding: 12px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      color: var(--code-text);
      white-space: pre-wrap;
    }

    /* ESTILOS EXCLUSIVOS PARA IMPRESIÓN Y PDF (TAMAÑO CARTA SIN ENCABEZADOS DE NAVEGADOR) */
    @media print {
      @page {
        size: letter;
        margin: 0; /* Elimina la ruta de archivo file:///... y fecha nativas de Chrome */
      }

      :root {
        --bg-color: #ffffff;
        --card-bg: #f8fafc;
        --border-color: #cbd5e1;
        --text-main: #0f172a;
        --text-muted: #475569;
        --success-bg: #f0fdf4;
        --success-border: #16a34a;
        --code-bg: #1e293b;
        --code-text: #38bdf8;
      }

      body {
        background-color: #ffffff !important;
        color: #0f172a !important;
        padding: 0 !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .container {
        max-width: 100% !important;
        width: 100% !important;
        padding: 15mm !important; /* Margen interno sustituto para el documento */
        box-sizing: border-box;
      }

      .brand {
        color: #1e40af !important;
      }

      .executive-summary h2 {
        color: #15803d !important;
      }

      .finding-card {
        border: 1px solid #cbd5e1 !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
      }

      .severity-HIGH, .severity-CRITICAL {
        background: #fee2e2 !important;
        color: #dc2626 !important;
        border: 1px solid #f87171 !important;
      }

      .severity-MEDIUM {
        background: #fef3c7 !important;
        color: #d97706 !important;
        border: 1px solid #fbbf24 !important;
      }

      .severity-LOW {
        background: #dbeafe !important;
        color: #2563eb !important;
        border: 1px solid #60a5fa !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">🛡️ QA-SEC SUITE</div>
      <div class="badge-secured">• Secured</div>
    </div>

    <div class="meta-card">
      <div class="meta-item">
        <label>Título del Reporte</label>
        <span>${title}</span>
      </div>
      <div class="meta-item">
        <label>Objetivo de Auditoría</label>
        <span>${targetUrl || 'N/A'}</span>
      </div>
      <div class="meta-item">
        <label>Puntaje de Salud</label>
        <span>${score !== undefined ? `${score}/100` : 'N/A'}</span>
      </div>
      <div class="meta-item">
        <label>Fecha de Generación</label>
        <span>${new Date().toLocaleString()}</span>
      </div>
    </div>

    <div class="executive-summary">
      <h2>💡 Resumen Ejecutivo (Gemini AI)</h2>
      <p style="margin: 0; color: inherit;">${summary}</p>
    </div>

    <h2 style="font-size: 18px; margin-bottom: 20px;">🔍 Trazabilidad y Hallazgos Técnicos (${findings.length})</h2>

    ${findings
      .map(
        (item, index) => `
      <div class="finding-card">
        <div class="finding-header">
          <h3 class="finding-title">${index + 1}. ${item.title}</h3>
          <span class="severity-badge severity-${(item.severity || 'LOW').toUpperCase()}">${item.severity}</span>
        </div>
        
        <div class="section-title">Descripción</div>
        <p style="margin: 0; color: inherit;">${item.description}</p>

        ${
          item.recommendation
            ? `
          <div class="section-title">Dictamen & Mitigación Defensiva (Gemini AI)</div>
          <div class="code-box">${item.recommendation}</div>
        `
            : ''
        }

        ${
          item.evidence
            ? `
          <div class="section-title">Evidencia Técnica</div>
          <div class="code-box">${item.evidence}</div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}

    ${
      remediatedCode
        ? `
      <div class="finding-card">
        <h3 class="finding-title">🛠️ Código Remedio Sugerido</h3>
        <div class="code-box" style="margin-top: 10px;">${remediatedCode}</div>
      </div>
    `
        : ''
    }
  </div>
</body>
</html>`;
  };

  const handleExport = async (format: 'html' | 'markdown') => {
    setDownloading(true);
    try {
      if (format === 'html') {
        const htmlContent = generateStyledHtml();
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_seguridad_${Date.now()}.html`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        await exportReportApi({
          title,
          targetUrl,
          summary,
          score,
          findings,
          remediatedCode,
          format,
        });
      }
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