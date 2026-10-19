import type { ConsolidatedReportInputDTO, ConsolidatedExecutiveSummary } from '../../modules/report/consolidatedReport.types.js';

interface EasmAiSummary {
  summary?: string;
  riskLevel?: string;
  recommendations?: string[];
}

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

    // Preparación de datos EASM
    let easmHtmlSection = '';
    if (data.includedModules.easmAudit && data.easmData) {
      const easm = data.easmData;
      const dnsRecords = easm.dnsRecords || [];
      const subdomains = easm.subdomains || [];
      const wafAndTech = easm.wafAndTech || {};
      const sslDetails = easm.sslDetails || {};
      const ai = (easm.aiSummary || {}) as EasmAiSummary;

      const dnsRowsHtml = dnsRecords.length === 0
        ? '<tr><td colSpan="2" style="color: #94a3b8;">Sin registros DNS obtenidos.</td></tr>'
        : dnsRecords.map((r: any) => `
            <tr>
              <td><strong style="color: #38bdf8;">${r.type}</strong></td>
              <td style="font-family: monospace;">${r.value}</td>
            </tr>
          `).join('');

      const subdomainsRowsHtml = subdomains.length === 0
        ? '<tr><td colSpan="3" style="color: #94a3b8;">No se detectaron subdominios adicionales activos.</td></tr>'
        : subdomains.map((s: any) => `
            <tr>
              <td><strong style="color: #38bdf8;">${s.subdomain}</strong></td>
              <td style="font-family: monospace;">${s.ipAddress || 'Sin IP asignada'}</td>
              <td><span style="color: #22c55e; font-weight: bold;">${s.status}</span></td>
            </tr>
          `).join('');

      easmHtmlSection = `
        <h2>🕸️ Módulo 7: External Attack Surface Management (EASM & OSINT)</h2>
        <div class="card" style="margin-bottom: 20px;">
          <p><strong>Dominio Objetivo:</strong> ${easm.targetDomain}</p>
          <p><strong>Subdominios Públicos Descubiertos:</strong> <strong style="color: #38bdf8;">${subdomains.length}</strong></p>
          <p><strong>WAF Detectado:</strong> <strong style="color: ${wafAndTech.wafDetected ? '#22c55e' : '#facc15'};">${wafAndTech.wafDetected ? wafAndTech.wafName || 'Sí' : 'No Detectado'}</strong></p>
          <p><strong>Encabezado Server HTTP:</strong> <code>${wafAndTech.serverHeader || 'No Revelado'}</code></p>
          <p><strong>Certificado SSL/TLS:</strong> <strong style="color: ${sslDetails.valid ? '#22c55e' : '#ef4444'};">${sslDetails.valid ? `VÁLIDO (${sslDetails.daysRemaining ?? 'N/A'} días restantes)` : 'INVÁLIDO / EXPIRADO'}</strong></p>
          <p><strong>Emisor Certificado:</strong> ${sslDetails.issuer || 'Desconocido'}</p>
          ${ai.summary ? `<p><strong>Diagnóstico Perimetral IA:</strong> ${ai.summary}</p>` : ''}

          <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">🌐 Todos los Registros DNS Detectados (${dnsRecords.length}):</h4>
          <table>
            <thead>
              <tr><th>Tipo</th><th>Valor / Host Destino</th></tr>
            </thead>
            <tbody>
              ${dnsRowsHtml}
            </tbody>
          </table>

          <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">🔍 Mapeo Completo de Subdominios (${subdomains.length}):</h4>
          <table>
            <thead>
              <tr><th>Subdominio FQDN</th><th>Dirección IP Pública</th><th>Estado</th></tr>
            </thead>
            <tbody>
              ${subdomainsRowsHtml}
            </tbody>
          </table>
        </div>
      `;
    }

    // Preparación de datos Red Team
    let redTeamHtmlSection = '';
    if (data.includedModules.redTeamAudit && data.redTeamData) {
      const red = data.redTeamData;
      const jwtFindings = red.jwtFindings || [];
      const corsFindings = red.corsFindings || [];

      redTeamHtmlSection = `
        <h2>⚔️ Módulo 8: Red Team & Explotación Activa</h2>
        <div class="card" style="margin-bottom: 20px;">
          <p><strong>URL Endpoint Objetivo:</strong> <code>${red.targetUrl}</code></p>
          <p><strong>Hallazgos JWT:</strong> <strong style="color: ${jwtFindings.length > 0 ? '#ef4444' : '#22c55e'};">${jwtFindings.length}</strong></p>
          <p><strong>Hallazgos CORS:</strong> <strong style="color: ${corsFindings.length > 0 ? '#ef4444' : '#22c55e'};">${corsFindings.length}</strong></p>
          <p><strong>Simulaciones de Phishing:</strong> <strong style="color: #38bdf8;">${red.phishingSimulatedCount}</strong></p>
          ${red.aiSummary?.summary ? `<p><strong>Diagnóstico Red Team IA:</strong> ${red.aiSummary.summary}</p>` : ''}
        </div>
      `;
    }

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
        <h1 class="title">🛡️ QA-Sec Suite - Informe Consolidado Ejecutivo</h1>
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

    <!-- MÓDULO 1: WEB SCAN -->
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

    <!-- MÓDULO 2: NETWORK -->
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

    <!-- MÓDULO 3: SAST -->
    ${data.includedModules.sastAudit && data.sastData ? `
      <h2>🔍 Módulo 3: Auditoría Estática de Código (SAST)</h2>
      <div class="card" style="margin-bottom: 20px;">
        <p><strong>Archivo Analizado:</strong> ${data.sastData.fileName}</p>
        <p><strong>Health Score de Código:</strong> <strong style="color: #38bdf8;">${data.sastData.healthScore} / 100</strong></p>
        <p><strong>Total Vulnerabilidades:</strong> ${data.sastData.findings.length}</p>
      </div>
    ` : ''}

    <!-- MÓDULO 4: LOAD TEST -->
    ${data.includedModules.loadTest && data.loadTestData ? `
      <h2>💥 Módulo 4: Resiliencia & Pruebas de Carga DoS</h2>
      <div class="card" style="margin-bottom: 20px;">
        <p><strong>Endpoint Evaluado:</strong> ${data.loadTestData.targetUrl}</p>
        <p><strong>Peticiones por Segundo (RPS):</strong> <strong style="color: #a855f7;">${data.loadTestData.rps} req/s</strong></p>
        <p><strong>Latencia Promedio:</strong> ${data.loadTestData.avgLatencyMs} ms</p>
        <p><strong>Total Peticiones Enviadas:</strong> ${data.loadTestData.metrics.totalRequests}</p>
      </div>
    ` : ''}

    <!-- MÓDULO 5: DAST -->
    ${data.includedModules.dastAudit && data.dastData ? `
      <h2>🛡️ Módulo 5: DAST & OpenAPI Dynamic Fuzzing</h2>
      <div class="card" style="margin-bottom: 20px;">
        <p><strong>URL Base Objetivo:</strong> ${data.dastData.targetBaseUrl}</p>
        <p><strong>Endpoints Auditados:</strong> ${data.dastData.totalTestedEndpoints}</p>
        <p><strong>Hallazgos Detectados:</strong> <strong style="color: ${data.dastData.findings.length > 0 ? '#ef4444' : '#22c55e'};">${data.dastData.findings.length}</strong></p>${(data.dastData.aiSummary as any)?.summary ? `<p><strong>Diagnóstico DAST:</strong> ${(data.dastData.aiSummary as any).summary}</p>` : ''}
      </div>
    ` : ''}

    <!-- MÓDULO 6: SCA -->
    ${data.includedModules.scaAudit && data.scaData ? `
      <h2>🔐 Módulo 6: SCA & Supply Chain Security</h2>
      <div class="card" style="margin-bottom: 20px;">
        <p><strong>Manifest / Configuración:</strong> ${data.scaData.manifestType}</p>
        <p><strong>Dependencias Auditadas:</strong> ${data.scaData.totalDependenciesAudited}</p>
        <p><strong>Vulnerabilidades en Paquetes:</strong> <strong style="color: ${data.scaData.vulnerabilities.length > 0 ? '#ef4444' : '#22c55e'};">${data.scaData.vulnerabilities.length}</strong></p>
        <p><strong>Secretos Git Expuestos:</strong> <strong style="color: ${data.scaData.gitSecrets.length > 0 ? '#ef4444' : '#22c55e'};">${data.scaData.gitSecrets.length}</strong></p>
      </div>
    ` : ''}

    <!-- MÓDULO 7: EASM SECCIÓN COMPLETA -->
    ${easmHtmlSection}

    <!-- MÓDULO 8: RED TEAM SECCIÓN COMPLETA -->
    ${redTeamHtmlSection}

  </div>
</body>
</html>`;
  }

  public generateMarkdownReport(
    data: ConsolidatedReportInputDTO,
    aiSummary: ConsolidatedExecutiveSummary
  ): string {
    let markdown = `# 🛡️ QA-Sec Suite - Informe Consolidado Ejecutivo
**Proyecto:** ${data.projectName}
**Fecha:** ${new Date().toLocaleString('es-ES')}
**Nivel de Riesgo Consolidado:** ${aiSummary.overallRiskLevel}
**Score Global de Salud:** ${aiSummary.globalHealthScore} / 100

---

## 🤖 Resumen Ejecutivo (Gemini AI)
${aiSummary.executiveOverview}

### 💡 Plan de Mitigación Prioritario
${aiSummary.priorityRemediations.map((r, i) => `${i + 1}.${r}`).join('\n')}

---
`;

    if (data.includedModules.webScan && data.webFindings) {
      markdown += `\n## 🌐 Módulo 1: Auditoría Web & Inputs\nTotal hallazgos: ${data.webFindings.length}\n`;
    }

    if (data.includedModules.networkScan && data.networkData) {
      markdown += `\n## 🛡️ Módulo 2: Red & Perímetro\nHost: ${data.networkData.targetHost}\nPuertos Abiertos: ${data.networkData.openPorts.length}\n`;
    }

    if (data.includedModules.sastAudit && data.sastData) {
      markdown += `\n## 🔍 Módulo 3: SAST & Código\nArchivo: ${data.sastData.fileName}\nHealth Score: ${data.sastData.healthScore}/100\n`;
    }

    if (data.includedModules.loadTest && data.loadTestData) {
      markdown += `\n## 💥 Módulo 4: Pruebas de Carga\nTarget: ${data.loadTestData.targetUrl}\nRPS: ${data.loadTestData.rps}\n`;
    }

    if (data.includedModules.dastAudit && data.dastData) {
      markdown += `\n## 🛡️ Módulo 5: DAST & API Fuzzing\nTarget: ${data.dastData.targetBaseUrl}\nHallazgos: ${data.dastData.findings.length}\n`;
    }

    if (data.includedModules.scaAudit && data.scaData) {
      markdown += `\n## 🔐 Módulo 6: SCA & Cadena de Suministro\nVulnerabilidades: ${data.scaData.vulnerabilities.length}\nSecretos Expuestos: ${data.scaData.gitSecrets.length}\n`;
    }

    if (data.includedModules.easmAudit && data.easmData) {
      const dns = data.easmData.dnsRecords || [];
      const subs = data.easmData.subdomains || [];
      const dnsList = dns.map((r: any) => `- [${r.type}] ${r.value}`).join('\n');
      const subsList = subs.map((s: any) => `- ${s.subdomain} (IP: ${s.ipAddress || 'N/A'})`).join('\n');

      markdown += `\n## 🕸️ Módulo 7: EASM & Recon OSINT
**Dominio:** ${data.easmData.targetDomain}
**WAF:** ${data.easmData.wafAndTech?.wafDetected ? data.easmData.wafAndTech?.wafName || 'Sí' : 'No Detectado'}
**SSL:** ${data.easmData.sslDetails?.valid ? 'VÁLIDO' : 'INVÁLIDO'}

### Registros DNS (${dns.length}):
${dnsList || 'Sin registros obtenidos.'}

### Subdominios (${subs.length}):
${subsList || 'Sin subdominios detectados.'}
`;
    }

    if (data.includedModules.redTeamAudit && data.redTeamData) {
      const red = data.redTeamData;
      markdown += `\n## ⚔️ Módulo 8: Red Team & Explotación Activa
**Target:** ${red.targetUrl}
**Hallazgos JWT:** ${red.jwtFindings.length}
**Hallazgos CORS:** ${red.corsFindings.length}
**Envíos Phishing:** ${red.phishingSimulatedCount}
`;
    }

    markdown += `\n---\n*Informe generado automáticamente por QA-Sec Suite Orchestrator.*`;
    return markdown;
  }
}