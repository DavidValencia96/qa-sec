import React, { useState } from 'react';
import type { SastHistoryItem } from '../../services/api.client';

interface SastHistoryTableProps {
  items: SastHistoryItem[];
  onSelectAudit: (item: SastHistoryItem) => void;
}

const renderTesterBadge = (email?: string) => {
  const isGuest = !email || email.toLowerCase() === 'visitante';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '5px',
        fontSize: '11px',
        fontFamily: isGuest ? 'sans-serif' : 'monospace',
        fontWeight: 600,
        backgroundColor: isGuest ? 'rgba(100, 116, 139, 0.15)' : 'rgba(2, 132, 199, 0.2)',
        color: isGuest ? '#94a3b8' : '#38bdf8',
        border: `1px solid ${isGuest ? 'rgba(148, 163, 184, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{isGuest ? '👤' : '✉️'}</span>
      <span>{isGuest ? 'visitante' : email}</span>
    </span>
  );
};

export const SastHistoryTable: React.FC<SastHistoryTableProps> = ({ items, onSelectAudit }) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (!items || items.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: '#94a3b8',
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(30, 41, 59, 0.8)',
          fontSize: '13px',
        }}
      >
        📜 No hay registros de auditorías SAST guardados en MySQL.
      </div>
    );
  }

  const handleExportSingle = (item: SastHistoryItem, format: 'html' | 'markdown') => {
    try {
      const content = format === 'html' ? generateHtmlReport(item) : generateMarkdownReport(item);
      const mimeType = format === 'html' ? 'text/html' : 'text/markdown';
      const extension = format === 'html' ? 'html' : 'md';

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_sast_${item.fileName || 'audit'}_${item.id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error al exportar reporte SAST: ${(err as Error).message}`);
    }
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '20%' }}>Archivo Auditado</th>
            <th style={{ padding: '14px 16px', width: '8%' }}>Tipo</th>
            <th style={{ padding: '14px 16px', width: '10%' }}>Salud</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Hallazgos</th>
            <th style={{ padding: '14px 16px', width: '14%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', width: '14%' }}>Tester</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '22%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isHovered = hoveredRow === item.id;
            const totalFindings = item.totalFindings ?? (item.findings ? item.findings.length : 0);

            const isGood = item.healthScore >= 80;
            const isMedium = item.healthScore >= 50;

            const scoreBg = isGood ? 'rgba(6, 78, 59, 0.4)' : isMedium ? 'rgba(113, 63, 18, 0.4)' : 'rgba(127, 29, 29, 0.4)';
            const scoreBorder = isGood ? 'rgba(52, 211, 153, 0.4)' : isMedium ? 'rgba(250, 204, 21, 0.4)' : 'rgba(248, 113, 113, 0.4)';
            const scoreColor = isGood ? '#34d399' : isMedium ? '#facc15' : '#f87171';

            return (
              <tr
                key={item.id}
                onMouseEnter={() => setHoveredRow(item.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderBottom: '1px solid rgba(30, 41, 59, 0.6)',
                  backgroundColor: isHovered ? 'rgba(30, 41, 59, 0.35)' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* ARCHIVO AUDITADO */}
                <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc', fontSize: '13px' }}>
                  <span style={{ marginRight: '6px' }}>📄</span> {item.fileName}
                </td>

                {/* TIPO */}
                <td style={{ padding: '14px 16px' }}>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      backgroundColor: '#020617',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {item.fileType || 'code'}
                  </code>
                </td>

                {/* SALUD */}
                <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                  <span
                    style={{
                      backgroundColor: scoreBg,
                      border: `1px solid ${scoreBorder}`,
                      color: scoreColor,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      display: 'inline-block',
                    }}
                  >
                    {item.healthScore} / 100
                  </span>
                </td>

                {/* HALLAZGOS */}
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      backgroundColor: totalFindings > 0 ? 'rgba(127, 29, 29, 0.4)' : 'rgba(6, 78, 59, 0.4)',
                      border: `1px solid ${totalFindings > 0 ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                      color: totalFindings > 0 ? '#f87171' : '#34d399',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}
                  >
                    {totalFindings} hallazgos
                  </span>
                </td>

                {/* FECHA */}
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {new Date(item.createdAt).toLocaleString('es-ES')}
                </td>

                {/* TESTER */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  {renderTesterBadge(item.testerEmail)}
                </td>

                {/* ACCIONES */}
                <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleExportSingle(item, 'html')}
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      📥 Exportar HTML
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportSingle(item, 'markdown')}
                      style={{
                        backgroundColor: 'rgba(51, 65, 85, 0.4)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(148, 163, 184, 0.4)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      📝 Exportar Markdown
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectAudit(item)}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: '1px solid rgba(56, 189, 248, 0.5)',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      👁️ Ver Detalle
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function generateHtmlReport(item: SastHistoryItem): string {
  const findingsList = item.findings && item.findings.length > 0
    ? item.findings.map(f => `
      <div style="background:#020617; border:1px solid #ef4444; border-radius:8px; padding:12px; margin-bottom:12px;">
        <h4 style="color:#f87171; margin:0 0 6px 0;">[${f.severity}] ${f.title}</h4>
        <p style="color:#cbd5e1; font-size:13px; margin:0 0 8px 0;">${f.description}</p>
        ${f.recommendation ? `<p style="color:#34d399; font-size:12px; margin:0;">💡 <strong>Remediación:</strong> ${f.recommendation}</p>` : ''}
      </div>
    `).join('')
    : '<p style="color:#34d399;">✅ No se identificaron vulnerabilidades en el análisis SAST.</p>';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte SAST - ${item.fileName}</title>
      <style>
        body { background-color: #040406; color: #f8fafc; font-family: system-ui, sans-serif; padding: 24px; }
        .card { background-color: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 20px; max-width: 800px; margin: auto; }
        h1 { color: #38bdf8; font-size: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🔍 Reporte de Auditoría SAST</h1>
        <p><strong>Archivo:</strong> <code>${item.fileName}</code></p>
        <p><strong>Tester:</strong> <code>${item.testerEmail || 'visitante'}</code></p>
        <p><strong>Puntaje de Salud:</strong> ${item.healthScore} / 100</p>
        <p><strong>Fecha:</strong> ${new Date(item.createdAt).toLocaleString('es-ES')}</p>
        <hr style="border-color:#334155; margin:16px 0;" />
        <h3>Hallazgos</h3>
        ${findingsList}
      </div>
    </body>
    </html>
  `;
}

function generateMarkdownReport(item: SastHistoryItem): string {
  const findingsMd = item.findings && item.findings.length > 0
    ? item.findings.map(f => `### [${f.severity}] ${f.title}\n- **Descripción:** ${f.description}\n- **Remediación:** ${f.recommendation || 'N/A'}\n`).join('\n')
    : '✅ No se identificaron vulnerabilidades.\n';

  return `# 🔍 Reporte SAST - ${item.fileName}\n\n- **Archivo:** \`${item.fileName}\`\n- **Tester:** \`${item.testerEmail || 'visitante'}\`\n- **Salud:** ${item.healthScore}/100\n- **Fecha:** ${new Date(item.createdAt).toLocaleString('es-ES')}\n\n## Hallazgos\n\n${findingsMd}`;
}

export default SastHistoryTable;