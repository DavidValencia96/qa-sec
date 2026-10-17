import type { ConsolidatedReportInputDTO, ConsolidatedExecutiveSummary } from '../../modules/report/consolidatedReport.types.js';

export class ConsolidatedReportFormatterService {
  public generateHtmlReport(
    data: ConsolidatedReportInputDTO,
    aiSummary: ConsolidatedExecutiveSummary
  ): string {
    const riskBadgeColor =
      aiSummary.overallRiskLevel === 'CRITICAL'
        ? '#ef4444'
        : aiSummary.overallRiskLevel === 'HIGH'
        ? '#f97316'
        : aiSummary.overallRiskLevel === 'MEDIUM'
        ? '#eab308'
        : '#22c55e';

    const dateStr = new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Consolidado de Ciberseguridad - ${data.projectName}</title>
  <style>
    @media print {
      body { background-color: #ffffff !important; color: #000000 !important; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background-color: #1e293b;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }
    .header {
      border-bottom: 2px solid #334155;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #38bdf8;
      margin: 0;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-top: 4px;
    }
    .badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      color: #ffffff;
      display: inline-block;
    }
    .grid-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background-color: #0f172a;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .card-title {
      font-size: 16px;
      font-weight: bold;
      color: #38bdf8;
      margin-top: 0;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      margin-bottom: 24px;
    }
    th, td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid #334155;
      font-size: 14px;
    }
    th {
      background-color: #0f172a;
      color: #38bdf8;
    }
    .btn-print {
      background-color: #0284c7;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">🛡️ QA-Sec Suite - Informe Consolidado Ejecuto</h1>
        <div class="subtitle">Proyecto: <strong>${data.projectName}</strong> | Generado: ${dateStr}</div>
      </div>
      <div class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Guardar en PDF / Imprimir</button>
      </div>
    </div>

    <!-- SECCIÓN RESUMEN EJECUTIVO Y IA -->
    <div class="grid-summary">
      <div class="card">
        <h3 class="card-title">📊 Matriz de Riesgo Global</h3>
        <p>Nivel de Riesgo Consolidado: <span class="badge" style="background-color: ${riskBadgeColor};">${aiSummary.overallRiskLevel}</span></p>
        <p>Score Global de Salud: <strong style="font-size: 20px; color: #38bdf8;">${aiSummary.globalHealthScore} / 100</strong></p>
      </div>
      <div class="card">
        <h3 class="card-title">🤖 Diagnóstico Estratégico (Gemini AI)</h3>
        <p style="font-size: 13px; color: #cbd5e1; margin: 0;">${aiSummary.executiveOverview}</p>
      </div>
    </div>

    <!-- RECOMENDACIONES PRIORITARIAS -->
    <div class="card" style="margin-bottom: 30px;">
      <h3 class="card-title">💡 Acciones Remediales Prioritarias</h3>
      <ul style="margin: 0; padding-left: 20px; color: #f1f5f9; font-size: 14px;">
        ${aiSummary.priorityRemediations.map((rec) => `<li style="margin-bottom: 6px;">${rec}</li>`).join('')}
      </ul>
    </div>

    ${data.includedModules.webScan && data.webFindings ? `
      <h2>🌐 Módulo 1: Auditoría Web & Inyección de Inputs</h2>
      <table>
        <thead>
          <tr><th>Hallazgo</th><th>Severidad</th><th>Descripción</th><th>Recomendación</th></tr>
        </thead>
        <tbody>
          ${data.webFindings.map((f) => `
            <tr>
              <td><strong>${f.title}</strong></td>
              <td><span style="color: ${f.severity === 'CRITICAL' || f.severity === 'HIGH' ? '#ef4444' : '#facc15'}; font-weight: bold;">${f.severity}</span></td>
              <td>${f.description}</td>
              <td>${f.recommendation || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    ${data.includedModules.networkScan && data.networkData ? `
      <h2>🛡️ Módulo 2: Configuración & Superficie de Red</h2>
      <div class="card" style="margin-bottom: 20px;">
        <p><strong>Host Objetivo:</strong> ${data.networkData.targetHost}</p>
        <p><strong>Evaluación de Red:</strong> ${data.networkData.riskAssessment || 'Auditoría completada.'}</p>
        <h4>Puertos Abiertos Detectados:</h4>
        <ul>
          ${data.networkData.openPorts.length > 0
            ? data.networkData.openPorts.map((p) => `<li>Puerto ${p.port} (${p.service})</li>`).join('')
            : '<li>Ningún puerto expuesto públicamente.</li>'}
        </ul>
      </div>
    ` : ''}

    ${data.includedModules.sastAudit && data.sastData ? `
      <h2>🔍 Módulo 3: Auditoría Estática de Código (SAST)</h2>
      <div class="card" style="margin-bottom: 20px;">
        <p><strong>Archivo Analizado:</strong> ${data.sastData.fileName}</p>
        <p><strong>Health Score de Código:</strong> <strong style="color: #38bdf8;">${data.sastData.healthScore} / 100</strong></p>
        <p><strong>Total Vulnerabilidades:</strong> ${data.sastData.findings.length}</p>
      </div>
    ` : ''}

    ${data.includedModules.loadTest && data.loadTestData ? `
      <h2>💥 Módulo 4: Resiliencia & Pruebas de Carga DoS</h2>
      <div class="card">
        <p><strong>Endpoint Evaluado:</strong> ${data.loadTestData.targetUrl}</p>
        <p><strong>Peticiones por Segundo (RPS):</strong> <strong style="color: #a855f7;">${data.loadTestData.rps} req/s</strong></p>
        <p><strong>Latencia Promedio:</strong> ${data.loadTestData.avgLatencyMs} ms</p>
        <p><strong>Total Peticiones Enviadas:</strong> ${data.loadTestData.metrics.totalRequests}</p>
      </div>
    ` : ''}

  </div>
</body>
</html>`;
  }

  public generateMarkdownReport(
    data: ConsolidatedReportInputDTO,
    aiSummary: ConsolidatedExecutiveSummary
  ): string {
    return `# 🛡️ QA-Sec Suite - Informe Consolidado Ejecuto
**Proyecto:** ${data.projectName}
**Fecha:** ${new Date().toLocaleString()}
**Nivel de Riesgo Consolidado:** ${aiSummary.overallRiskLevel}
**Score Global de Salud:** ${aiSummary.globalHealthScore} / 100

---

## 🤖 Resumen Ejecutivo (Gemini AI)
${aiSummary.executiveOverview}

### 💡 Plan de Mitigación Prioritario
${aiSummary.priorityRemediations.map((r, i) => `${i + 1}.${r}`).join('\n')}

---
*Informe generado automáticamente por QA-Sec Suite Orchestrator.*`;
  }
}