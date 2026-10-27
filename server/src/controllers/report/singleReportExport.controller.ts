import type { Request, Response } from 'express';
import { GeminiAIService } from '../../services/gemini.service.js';
import { ConsolidatedReportFormatterService } from '../../services/report/consolidatedReportFormatter.service.js';
import type { ConsolidatedReportInputDTO } from '../../modules/report/consolidatedReport.types.js';
import type { DastFinding } from '../../modules/dast/dast.types.js';
import type { JwtFinding, CorsFinding } from '../../modules/redteam/redteam.types.js';
import { getDbPool } from '../../config/database.js';
import { logAuditEvent } from '../../services/auditLog.service.js';

const geminiService = new GeminiAIService();
const formatterService = new ConsolidatedReportFormatterService();

export const exportConsolidatedReportHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as ConsolidatedReportInputDTO;

    if (!data.projectName) {
      res.status(400).json({ success: false, error: 'El nombre del proyecto (projectName) es requerido.' });
      return;
    }

    const pool = getDbPool();

    // 1. Consultar datos de DAST si está activado
    if (data.includedModules?.dastAudit) {
      const [dastRows]: any = await pool.query('SELECT * FROM dast_history ORDER BY created_at DESC LIMIT 1');
      if (dastRows.length > 0) {
        const lastDast = dastRows[0];
        (data as any).dastData = {
          targetBaseUrl: lastDast.target_base_url,
          totalTestedEndpoints: lastDast.total_endpoints_tested,
          findings: lastDast.findings_json ? JSON.parse(lastDast.findings_json) : [],
          aiSummary: lastDast.ai_summary_json ? JSON.parse(lastDast.ai_summary_json) : {},
        };
      }
    }

    // 2. Consultar datos de SCA si está activado
    if (data.includedModules?.scaAudit) {
      const [scaRows]: any = await pool.query('SELECT * FROM sca_history ORDER BY created_at DESC LIMIT 1');
      if (scaRows.length > 0) {
        const lastSca = scaRows[0];
        (data as any).scaData = {
          manifestType: lastSca.manifest_type,
          totalDependenciesAudited: lastSca.total_deps_audited,
          vulnerabilities: lastSca.vulnerabilities_json ? JSON.parse(lastSca.vulnerabilities_json) : [],
          gitSecrets: lastSca.git_secrets_json ? JSON.parse(lastSca.git_secrets_json) : [],
          aiSummary: lastSca.ai_summary_json ? JSON.parse(lastSca.ai_summary_json) : {},
        };
      }
    }

    // 3. Consultar datos de EASM si está activado
    if (data.includedModules?.easmAudit) {
      const [easmRows]: any = await pool.query('SELECT * FROM easm_history ORDER BY created_at DESC LIMIT 1');
      if (easmRows.length > 0) {
        const lastEasm = easmRows[0];
        (data as any).easmData = {
          targetDomain: lastEasm.target_domain,
          dnsRecords: lastEasm.dns_records_json ? JSON.parse(lastEasm.dns_records_json) : [],
          subdomains: lastEasm.subdomains_json ? JSON.parse(lastEasm.subdomains_json) : [],
          wafAndTech: lastEasm.waf_tech_json ? JSON.parse(lastEasm.waf_tech_json) : {},
          sslDetails: lastEasm.ssl_details_json ? JSON.parse(lastEasm.ssl_details_json) : {},
          aiSummary: lastEasm.ai_summary_json ? JSON.parse(lastEasm.ai_summary_json) : {},
        };
      }
    }

    // 4. Consultar datos de Red Team si está activado
    if (data.includedModules?.redTeamAudit) {
      const [redTeamRows]: any = await pool.query('SELECT * FROM redteam_history ORDER BY created_at DESC LIMIT 1');
      if (redTeamRows.length > 0) {
        const lastRedTeam = redTeamRows[0];
        (data as any).redTeamData = {
          targetUrl: lastRedTeam.target_url,
          jwtFindings: lastRedTeam.jwt_findings_json ? JSON.parse(lastRedTeam.jwt_findings_json) : [],
          corsFindings: lastRedTeam.cors_findings_json ? JSON.parse(lastRedTeam.cors_findings_json) : [],
          phishingSimulatedCount: lastRedTeam.phishing_count || 0,
          aiSummary: lastRedTeam.ai_summary_json ? JSON.parse(lastRedTeam.ai_summary_json) : {},
        };
      }
    }

    // 5. Consultar datos de Email Security si está activado
    if ((data.includedModules as any)?.emailSecAudit) {
      const [emailsecRows]: any = await pool.query('SELECT * FROM emailsec_history ORDER BY created_at DESC LIMIT 1');
      if (emailsecRows.length > 0) {
        const lastEmailSec = emailsecRows[0];
        (data as any).emailSecData = {
          domain: lastEmailSec.target_domain || 'N/A',
          spf: lastEmailSec.spf_json ? JSON.parse(lastEmailSec.spf_json) : null,
          dmarc: lastEmailSec.dmarc_json ? JSON.parse(lastEmailSec.dmarc_json) : null,
          rbl: lastEmailSec.rbl_json ? JSON.parse(lastEmailSec.rbl_json) : null,
          aiSummary: lastEmailSec.ai_summary_json ? JSON.parse(lastEmailSec.ai_summary_json) : {},
        };
      }
    }

    // 6. Diagnóstico Global con Gemini AI
    const aiSummary = await geminiService.generateConsolidatedExecutiveSummary(data);

    // Registro de auditoría
    const user = (req as any).user;
    await logAuditEvent({
      userId: user?.id || null,
      userEmail: user?.email || 'guest@qa-sec.local',
      action: 'REPORT_EXPORT',
      module: 'REPORTS',
      details: `Exportación consolidada de: ${data.projectName} (${data.format || 'html'})`,
      ipAddress: req.ip,
    });

    // 7. Generar informe en el formato solicitado
    if (data.format === 'markdown') {
      const markdownContent = formatterService.generateMarkdownReport(data, aiSummary);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="informe_consolidado_${data.projectName.toLowerCase().replace(/\s+/g, '_')}.md"`);
      res.status(200).send(markdownContent);
      return;
    }

    const htmlContent = formatterService.generateHtmlReport(data, aiSummary);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="informe_consolidado_${data.projectName.toLowerCase().replace(/\s+/g, '_')}.html"`);
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('[!] Error en exportConsolidatedReportHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const exportSingleRecordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleType, recordData } = req.body;

    if (!moduleType || !recordData) {
      res.status(400).json({ success: false, error: 'moduleType y recordData son requeridos.' });
      return;
    }

    const title = `Reporte_${moduleType.toUpperCase()}_${recordData.id || recordData.runId || 'Audit'}`;
    const dateStr = new Date(recordData.createdAt || Date.now()).toLocaleString('es-ES');

    let htmlBody = '';

    if (moduleType === 'load-test') {
      const metrics = recordData.metrics || {};
      const breakdown = metrics.statusBreakdown || {};
      const total = recordData.totalRequests || 1;

      // Porcentajes para la barra visual
      const p2xx = Math.round(((breakdown.status2xx || 0) / total) * 100);
      const p429 = Math.round(((breakdown.status429RateLimited || 0) / total) * 100);
      const p4xx = Math.round(((breakdown.status4xx || 0) / total) * 100);
      const p5xx = Math.round(((breakdown.status5xx || 0) / total) * 100);
      const pTimeout = Math.round(((breakdown.timeouts || 0) / total) * 100);

      const rawPayload = recordData.payloadJson || recordData.config?.payloadJson;
      const payloadText = rawPayload && String(rawPayload).trim().length > 0 ? String(rawPayload) : null;

      const rawHeaders = recordData.headersJson || recordData.config?.headersJson;
      const headersText = rawHeaders && String(rawHeaders).trim().length > 0 ? String(rawHeaders) : null;

      htmlBody = `
        <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🎯 Reporte Técnico - Prueba de Carga & Resiliencia DoS</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- ⚙️ CONFIGURACIÓN Y PARÁMETROS DE EJECUCIÓN -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">⚙️ Parametrización de la Carga Simulada</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem; margin-bottom: 16px;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">URL Objetivo Endpoint:</span>
              <strong style="color: #f8fafc; word-break: break-all;">${recordData.targetUrl}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Método HTTP:</span>
              <span class="method-badge-load">
                ${recordData.method}
              </span>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Clientes Concurrentes:</span>
              <strong style="color: #38bdf8;">${recordData.concurrency} clientes simultáneos</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Duración del Ataque:</span>
              <strong style="color: #facc15;">${recordData.durationSeconds} segundos</strong>
            </div>
          </div>

          <!-- MUESTRA DE CABECERAS HTTP -->
          <div style="padding-top: 14px; border-top: 1px solid #1e293b; margin-bottom: 12px;">
            <span style="color: #94a3b8; display: block; font-size: 0.8rem; margin-bottom: 6px;">
              🔑 Cabeceras HTTP Personalizadas (Headers):
            </span>
            ${headersText ? `
              <pre class="code-box-load">${headersText}</pre>
            ` : `
              <div class="empty-box-load">
                Sin cabeceras personalizadas adicionales (Standard Headers).
              </div>
            `}
          </div>

          <!-- MUESTRA DE PAYLOAD -->
          <div style="padding-top: 12px; border-top: 1px solid #1e293b;">
            <span style="color: #94a3b8; display: block; font-size: 0.8rem; margin-bottom: 6px;">
              📦 Payload HTTP Enviado (Body / Data):
            </span>
            ${payloadText ? `
              <pre class="code-box-load" style="color: #4ade80;">${payloadText}</pre>
            ` : `
              <div class="empty-box-load">
                Petición ejecutada sin cuerpo de datos (No Payload).
              </div>
            `}
          </div>
        </div>

        <!-- 🤖 SÍNTESIS EJECUTIVA DE GEMINI AI -->
        <div style="background: rgba(6, 78, 59, 0.2); padding: 20px; border-radius: 8px; border: 1px solid #047857; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #34d399; font-size: 1.05rem;">🤖 Diagnóstico de Resiliencia IA (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${recordData.aiDiagnosis?.summary || 'Se ejecutó la prueba de estrés evaluando la respuesta del servidor.'}
          </p>
        </div>

        <!-- 📊 MÉTRICAS PRINCIPALES DE PERFORMANCE (IDÉNTICAS AL HISTORIAL) -->
        <div class="load-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px;">
          <div class="metric-card-load" style="background: #111827; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #1f2937;">
            <span class="metric-label" style="font-size: 0.78rem; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Total Peticiones</span>
            <div style="font-size: 1.6rem; font-weight: bold; color: #38bdf8; margin-top: 6px;">${recordData.totalRequests}</div>
          </div>
          <div class="metric-card-load" style="background: #111827; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #38bdf8;">
            <span class="metric-label" style="font-size: 0.78rem; color: #38bdf8; font-weight: bold; text-transform: uppercase;">Peticiones / Seg (RPS)</span>
            <div style="font-size: 1.6rem; font-weight: bold; color: #a855f7; margin-top: 6px;">${recordData.rps} <span style="font-size: 0.9rem;">req/s</span></div>
          </div>
          <div class="metric-card-load" style="background: #111827; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #1f2937;">
            <span class="metric-label" style="font-size: 0.78rem; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Latencia Media</span>
            <div style="font-size: 1.6rem; font-weight: bold; color: #facc15; margin-top: 6px;">${recordData.avgLatencyMs} <span style="font-size: 0.9rem;">ms</span></div>
          </div>
          <div class="metric-card-load" style="background: #111827; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #1f2937;">
            <span class="metric-label" style="font-size: 0.78rem; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Latencia p95</span>
            <div style="font-size: 1.6rem; font-weight: bold; color: #f97316; margin-top: 6px;">${recordData.p95LatencyMs} <span style="font-size: 0.9rem;">ms</span></div>
          </div>
        </div>

        <!-- 📈 DESGLOSE DE RESPUESTAS HTTP (TARJETAS INDIVIDUALES CON BORDES DE COLOR DEL HISTORIAL) -->
        <div class="distribution-card-load" style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">📊 Desglose de Respuestas HTTP Servidor</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 16px;">
            <div class="status-box box-2xx" style="background: rgba(34, 197, 94, 0.1); padding: 12px; border-radius: 6px; border-left: 4px solid #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);">
              <span style="font-size: 0.75rem; color: #22c55e; font-weight: bold; display: block; margin-bottom: 4px;">2xx Exitosas</span>
              <strong style="font-size: 1.3rem; color: #4ade80;">${breakdown.status2xx || 0}</strong>
            </div>

            <div class="status-box box-429" style="background: rgba(56, 189, 248, 0.1); padding: 12px; border-radius: 6px; border-left: 4px solid #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">
              <span style="font-size: 0.75rem; color: #38bdf8; font-weight: bold; display: block; margin-bottom: 4px;">429 Rate Limited</span>
              <strong style="font-size: 1.3rem; color: #38bdf8;">${breakdown.status429RateLimited || 0}</strong>
            </div>

            <div class="status-box box-4xx" style="background: rgba(250, 204, 21, 0.1); padding: 12px; border-radius: 6px; border-left: 4px solid #facc15; border: 1px solid rgba(250, 204, 21, 0.3);">
              <span style="font-size: 0.75rem; color: #facc15; font-weight: bold; display: block; margin-bottom: 4px;">4xx Errores Cliente</span>
              <strong style="font-size: 1.3rem; color: #facc15;">${breakdown.status4xx || 0}</strong>
            </div>

            <div class="status-box box-5xx" style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);">
              <span style="font-size: 0.75rem; color: #f87171; font-weight: bold; display: block; margin-bottom: 4px;">5xx Caídas Servidor</span>
              <strong style="font-size: 1.3rem; color: #f87171;">${breakdown.status5xx || 0}</strong>
            </div>

            <div class="status-box box-timeout" style="background: rgba(168, 85, 247, 0.1); padding: 12px; border-radius: 6px; border-left: 4px solid #a855f7; border: 1px solid rgba(168, 85, 247, 0.3);">
              <span style="font-size: 0.75rem; color: #c084fc; font-weight: bold; display: block; margin-bottom: 4px;">Timeouts</span>
              <strong style="font-size: 1.3rem; color: #c084fc;">${breakdown.timeouts || 0}</strong>
            </div>
          </div>

          <!-- BARRA DE PORCENTAJE VISUAL -->
          <div class="bar-container-load" style="display: flex; height: 16px; border-radius: 6px; overflow: hidden; background: #1e293b; border: 1px solid #1f2937;">
            <div class="bar-segment seg-2xx" style="width: ${p2xx}%; background-color: #22c55e !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" title="2xx Exitosas (${p2xx}%)"></div>
            <div class="bar-segment seg-429" style="width: ${p429}%; background-color: #38bdf8 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" title="429 Rate Limit (${p429}%)"></div>
            <div class="bar-segment seg-4xx" style="width: ${p4xx}%; background-color: #facc15 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" title="4xx Cliente (${p4xx}%)"></div>
            <div class="bar-segment seg-5xx" style="width: ${p5xx}%; background-color: #ef4444 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" title="5xx Servidor (${p5xx}%)"></div>
            <div class="bar-segment seg-timeout" style="width: ${pTimeout}%; background-color: #a855f7 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" title="Timeouts (${pTimeout}%)"></div>
          </div>
        </div>

        <!-- 💡 RECOMENDACIONES -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Recomendaciones Defensivas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(recordData.aiDiagnosis?.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (moduleType === 'dast') {
      const findings: DastFinding[] = recordData.findings || [];
      const aiSummary = recordData.aiSummary || {};

      htmlBody = `
        <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🛡️ Reporte Técnico - Auditoría DAST & API Fuzzing</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || recordData.runId || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- PARAMETRIZACIÓN DAST -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">⚙️ Parámetros de Escaneo Dinámico</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">URL Base Objetivo:</span>
              <strong style="color: #f8fafc; word-break: break-all;">${recordData.targetBaseUrl || 'N/A'}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Endpoints Evaluados:</span>
              <strong style="color: #38bdf8;">${recordData.totalTestedEndpoints || 0} endpoints</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Total Hallazgos:</span>
              <strong style="color: ${findings.length > 0 ? '#ef4444' : '#22c55e'};">${findings.length} hallazgos</strong>
            </div>
          </div>
        </div>

        <!-- SÍNTESIS GEMINI IA -->
        <div style="background: rgba(6, 78, 59, 0.2); padding: 20px; border-radius: 8px; border: 1px solid #047857; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #34d399; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo DAST (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${typeof aiSummary === 'object' ? (aiSummary.summary || 'Escaneo dinámico de APIs completado.') : aiSummary}
          </p>
        </div>

        <!-- TABLA DE HALLAZGOS DAST -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🔍 Hallazgos de Seguridad Detectados (${findings.length})</h3>
          ${findings.length === 0 ? `
            <p style="color: #34d399; margin: 0; font-weight: 600;">✅ No se detectaron vulnerabilidades de BOLA ni inyecciones de cabeceras.</p>
          ` : findings.map((f) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid ${f.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #f8fafc;">[${f.vulnerabilityType}] ${f.httpMethod}${f.endpointPath}</strong>
                <span style="background: #0f172a; color: ${f.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                  ${f.severity}
                </span>
              </div>
              <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0 0 8px 0;">${f.description}</p>
              <div style="background: #030712; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #a7f3d0; word-break: break-all;">
                Evidence: ${f.evidencePayload}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- RECOMENDACIONES -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Recomendaciones Defensivas DAST</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(aiSummary.recommendations || [
              'Implementar validación estricta de autorización a nivel de objeto (BOLA/IDOR).',
              'Sanitizar encabezados HTTP y configurar una lista blanca de Hosts en el Proxy/WAF.'
            ]).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (moduleType === 'sca') {
      const vulnerabilities = recordData.vulnerabilities || [];
      const gitSecrets = recordData.gitSecrets || [];
      const aiSummary = recordData.aiSummary || {};

      htmlBody = `
        <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🔐 Reporte Técnico - SCA & Supply Chain Security</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- PARAMETRIZACIÓN SCA -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">⚙️ Resumen de Análisis de Cadena de Suministro</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Tipo de Manifest:</span>
              <strong style="color: #f8fafc;">${recordData.manifestType || 'package_json'}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Líneas / Dependencias Auditadas:</span>
              <strong style="color: #38bdf8;">${recordData.totalDependenciesAudited || 0}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Vulnerabilidades Encontradas:</span>
              <strong style="color: ${vulnerabilities.length > 0 ? '#ef4444' : '#22c55e'};">${vulnerabilities.length}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Secretos Expuestos:</span>
              <strong style="color: ${gitSecrets.length > 0 ? '#ef4444' : '#22c55e'};">${gitSecrets.length}</strong>
            </div>
          </div>
        </div>

        <!-- SÍNTESIS GEMINI IA -->
        <div style="background: rgba(6, 78, 59, 0.2); padding: 20px; border-radius: 8px; border: 1px solid #047857; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #34d399; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo SCA (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${aiSummary.summary || 'Análisis de dependencias y secretos Git completado.'}
          </p>
        </div>

        <!-- VULNERABILIDADES DE DEPENDENCIAS -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">📦 Vulnerabilidades en Dependencias (${vulnerabilities.length})</h3>
          ${vulnerabilities.length === 0 ? `
            <p style="color: #34d399; margin: 0; font-weight: 600;">✅ No se detectaron vulnerabilidades conocidas en las dependencias.</p>
          ` : vulnerabilities.map((v: any) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid ${v.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #f8fafc;">${v.packageName} (v${v.currentVersion})${v.cveId ? ` — ${v.cveId}` : ''}</strong>
                <span style="background: #0f172a; color: ${v.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                  ${v.severity}
                </span>
              </div>
              <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0 0 8px 0;">${v.description}</p>${v.patchedVersion ? `<div style="color: #34d399; font-size: 0.85rem; font-weight: bold;">💡 Versión Sugerida: ${v.patchedVersion}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- SECRETOS Y CREDENCIALES -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🔑 Secretos & Credenciales Expuestas (${gitSecrets.length})</h3>
          ${gitSecrets.length === 0 ? `
            <p style="color: #34d399; margin: 0; font-weight: 600;">✅ No se detectaron tokens ni claves expuestas.</p>
          ` : gitSecrets.map((s: any) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 12px;">
              <strong style="color: #f8fafc;">[${s.secretType}]${s.filePath}</strong>
              <div style="background: #030712; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #fca5a5; word-break: break-all; margin-top: 6px;">
                Patrón: ${s.matchedPattern}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- RECOMENDACIONES -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Acciones Correctivas Recomendadas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(aiSummary.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (moduleType === 'easm') {
      const dnsRecords = recordData.dnsRecords || [];
      const subdomains = recordData.subdomains || [];
      const wafAndTech = recordData.wafAndTech || {};
      const sslDetails = recordData.sslDetails || {};
      const aiSummary = recordData.aiSummary || {};

      const dnsRowsHtml = dnsRecords.length === 0
        ? '<tr><td colSpan="2" style="padding: 10px; color: #94a3b8;">Sin registros DNS obtenidos.</td></tr>'
        : dnsRecords.map((r: { type: string; value: string }) => `
            <tr style="border-bottom: 1px solid #1f2937;">
              <td style="padding: 8px 10px; color: #38bdf8; font-weight: bold;">${r.type}</td>
              <td style="padding: 8px 10px; font-family: monospace; word-break: break-all;">${r.value}</td>
            </tr>
          `).join('');

      const subdomainsRowsHtml = subdomains.length === 0
        ? '<tr><td colSpan="2" style="padding: 10px; color: #94a3b8;">No se detectaron subdominios públicos adicionales.</td></tr>'
        : subdomains.map((s: { subdomain: string; ipAddress?: string }) => `
            <tr style="border-bottom: 1px solid #1f2937;">
              <td style="padding: 8px 10px; color: #38bdf8; font-weight: bold;">${s.subdomain}</td>
              <td style="padding: 8px 10px; font-family: monospace;">IP: ${s.ipAddress || 'Sin IP asignada'}</td>
            </tr>
          `).join('');

      htmlBody = `
        <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🕸️ Reporte Técnico - External Attack Surface Management</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || recordData.runId || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- RESUMEN DEL PERÍMETRO -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">🌐 Resumen del Perímetro Expuesto</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Dominio Objetivo:</span>
              <strong style="color: #f8fafc;">${recordData.targetDomain}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Subdominios Descubiertos:</span>
              <strong style="color: #38bdf8;">${subdomains.length}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">WAF / Perímetro:</span>
              <strong style="color: ${wafAndTech.wafDetected ? '#22c55e' : '#facc15'};">${wafAndTech.wafDetected ? wafAndTech.wafName || 'Sí' : 'No Detectado'}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Estado SSL/TLS:</span>
              <strong style="color: ${sslDetails.valid ? '#22c55e' : '#ef4444'};">${sslDetails.valid ? `Válido (${sslDetails.daysRemaining ?? 'N/A'} días)` : 'Inválido'}</strong>
            </div>
          </div>
        </div>

        <!-- DIAGNÓSTICO IA -->
        <div style="background: rgba(6, 78, 59, 0.2); padding: 20px; border-radius: 8px; border: 1px solid #047857; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #34d399; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo EASM (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${aiSummary.summary || 'Análisis de la superficie de ataque completado.'}
          </p>
        </div>

        <!-- ACCIONES DEFENSIVAS -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Acciones Defensivas Recomendadas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
             ${(aiSummary.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>

        <!-- CAPA TÉCNICA HTTP Y SSL -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px; font-size: 0.9rem;">
          <h3 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 1rem;">🔒 Certificación SSL/TLS y Servidor</h3>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Emisor SSL:</strong> ${sslDetails.issuer || 'Desconocido'}</p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Encabezado Server:</strong> <code style="color: #38bdf8;">${wafAndTech.serverHeader || 'No revelado'}</code></p>
        </div>

        <!-- TABLA COMPLETA DE REGISTROS DNS -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🌐 Registros DNS Obtenidos (${dnsRecords.length})</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1;">
            <thead>
              <tr style="background: #1e293b; text-align: left; border-bottom: 1px solid #1f2937;">
                <th style="padding: 10px; color: #38bdf8;">Tipo</th>
                <th style="padding: 10px; color: #38bdf8;">Valor / Destino</th>
              </tr>
            </thead>
            <tbody>
              ${dnsRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- TABLA COMPLETA DE SUBDOMINIOS -->
        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🔍 Subdominios Descubiertos (${subdomains.length})</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1;">
            <thead>
              <tr style="background: #1e293b; text-align: left; border-bottom: 1px solid #1f2937;">
                <th style="padding: 10px; color: #38bdf8;">Subdominio FQDN</th>
                <th style="padding: 10px; color: #38bdf8;">Dirección IP Pública</th>
              </tr>
            </thead>
            <tbody>
              ${subdomainsRowsHtml}
            </tbody>
          </table>
        </div>
      `;
    } else if (moduleType === 'redteam') {
      const jwtFindings: JwtFinding[] = recordData.jwtFindings || [];
      const corsFindings: CorsFinding[] = recordData.corsFindings || [];
      const aiSummary = recordData.aiSummary || {};
      const targetUrl = recordData.targetUrl || 'No especificada';
      const jwtToken = recordData.jwtToken || null;

      htmlBody = `
        <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">⚔️ Reporte Técnico - Red Team & Explotación Activa</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || recordData.runId || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">🎯 Objetivo Evaluado & Configuración</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; font-size: 0.9rem; margin-bottom: 16px;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">URL Endpoint Objetivo:</span>
              <strong style="color: #f8fafc; word-break: break-all;">${targetUrl}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Vulnerabilidades JWT:</span>
              <strong style="color: ${jwtFindings.length > 0 ? '#ef4444' : '#22c55e'};">${jwtFindings.length} hallazgos</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Vulnerabilidades CORS:</span>
              <strong style="color: ${corsFindings.length > 0 ? '#ef4444' : '#22c55e'};">${corsFindings.length} hallazgos</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Simulaciones Phishing:</span>
              <strong style="color: #38bdf8;">${recordData.phishingSimulatedCount || 0} envíos</strong>
            </div>
          </div>

          <div style="padding-top: 12px; border-top: 1px solid #1e293b;">
            <span style="color: #94a3b8; display: block; font-size: 0.8rem; margin-bottom: 6px;">
              🔑 Token JWT Evaluado Durante la Auditoría:
            </span>
            ${jwtToken ? `
              <pre style="background: #030712; color: #f97316; padding: 10px 12px; border-radius: 6px; border: 1px solid #1f2937; font-family: monospace; font-size: 0.8rem; margin: 0; overflow-x: auto; word-break: break-all; white-space: pre-wrap;">${jwtToken}</pre>
            ` : `
              <div style="background: #030712; color: #64748b; padding: 8px 12px; border-radius: 6px; border: 1px dashed #1f2937; font-size: 0.85rem; font-style: italic;">
                Prueba ejecutada sin token JWT adjunto.
              </div>
            `}
          </div>
        </div>

        <div style="background: rgba(6, 78, 59, 0.2); padding: 20px; border-radius: 8px; border: 1px solid #047857; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #34d399; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo Red Team (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${aiSummary.summary || 'Pruebas de explotación de firmas JWT y políticas CORS completadas.'}
          </p>
        </div>

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🔑 Vulnerabilidades de Autenticación JWT (${jwtFindings.length})</h3>
          ${jwtFindings.length === 0 ? `
            <p style="color: #34d399; margin: 0; font-weight: 600;">✅ La verificación de firmas JWT es estricta. No se detectaron vulnerabilidades explotables de algoritmo "none", secretos débiles ni Key Confusion.</p>
          ` : jwtFindings.map((f) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid ${f.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #f8fafc;">[${f.vulnerabilityType}]</strong>
                <span style="background: #0f172a; color: ${f.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                  ${f.severity}
                </span>
              </div>
              <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0 0 8px 0;">${f.description}</p>${f.evidenceToken ? `
                <div style="background: #030712; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #a7f3d0; word-break: break-all; margin-bottom: 6px;">
                  Token de Evidencia Explotado: ${f.evidenceToken}
                </div>
              ` : ''}
              <div style="color: #a1a1aa; font-size: 0.85rem;"><strong>Remediación:</strong> ${f.remediation}</div>
            </div>
          `).join('')}
        </div>

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🌐 Malas Configuraciones CORS Explotables (${corsFindings.length})</h3>
          ${corsFindings.length === 0 ? `
            <p style="color: #34d399; margin: 0; font-weight: 600;">✅ Las políticas Cross-Origin Resource Sharing (CORS) son strictly seguras.</p>
          ` : corsFindings.map((f) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid #f97316; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #f8fafc;">[${f.vulnerabilityType}] Origen Explotado:${f.testedOrigin}</strong>
                <span style="background: #0f172a; color: #f97316; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                  ${f.severity}
                </span>
              </div>
              <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0 0 8px 0;">${f.description}</p>
              <div style="color: #a1a1aa; font-size: 0.85rem;"><strong>Remediación:</strong> ${f.remediation}</div>
            </div>
          `).join('')}
        </div>

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Acciones Defensivas Sugeridas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(aiSummary.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (moduleType === 'emailsec') {
      const spf = recordData.spfJson ? JSON.parse(recordData.spfJson) : (recordData.spf || null);
      const dmarc = recordData.dmarcJson ? JSON.parse(recordData.dmarcJson) : (recordData.dmarc || null);
      const rbl = recordData.rblJson ? JSON.parse(recordData.rblJson) : (recordData.rbl || null);
      const aiSummary = recordData.aiSummaryJson ? JSON.parse(recordData.aiSummaryJson) : (recordData.aiSummary || {});
      const targetDomain = recordData.target_domain || recordData.targetDomain || 'N/A';
      const targetIp = recordData.target_ip || recordData.targetIp || 'N/A';

      htmlBody = `
        <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">✉️ Reporte Técnico - Email Security & Defense (OSINT)</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || recordData.runId || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">🎯 Objetivo Evaluado & Parámetros</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Dominio Objetivo:</span>
              <strong style="color: #f8fafc;">${targetDomain}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">IP Consultada RBL:</span>
              <strong style="color: #38bdf8;">${targetIp}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Estado SPF:</span>
              <strong style="color: ${spf?.valid ? '#22c55e' : '#ef4444'};">${spf?.valid ? 'VÁLIDO' : 'INVÁLIDO / AUSENTE'}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Política DMARC:</span>
              <strong style="color: ${dmarc?.policy === 'reject' ? '#22c55e' : '#ef4444'};">${dmarc?.policy ? dmarc.policy.toUpperCase() : 'MISSING'}</strong>
            </div>
          </div>
        </div>

        <div style="background: rgba(6, 78, 59, 0.2); padding: 20px; border-radius: 8px; border: 1px solid #047857; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #34d399; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo Email Sec (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${aiSummary.summary || 'Auditoría de autenticación de correo y listas negras completada.'}
          </p>
        </div>

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 1rem;">📋 Registro SPF Detectado</h3>
          <pre style="background: #030712; color: ${spf?.valid ? '#34d399' : '#f87171'}; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; margin: 0; overflow-x: auto;">${spf?.raw || 'Sin registro SPF configurado'}</pre>
          ${(spf?.warnings || []).map((w: string) => `<div style="color: #f97316; font-size: 0.8rem; margin-top: 4px;">⚠️ ${w}</div>`).join('')}
        </div>

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 1rem;">🛡️ Registro DMARC Detectado</h3>
          <pre style="background: #030712; color: ${dmarc?.valid ? '#34d399' : '#f87171'}; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; margin: 0; overflow-x: auto;">${dmarc?.raw || 'Sin registro DMARC configurado'}</pre>
          ${(dmarc?.warnings || []).map((w: string) => `<div style="color: #f97316; font-size: 0.8rem; margin-top: 4px;">⚠️ ${w}</div>`).join('')}
        </div>

        ${rbl ? `
          <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 1rem;">🛑 Reputación IP RBL (${rbl.ip})</h3>
            <p style="color: ${rbl.blacklisted ? '#ef4444' : '#22c55e'}; font-weight: bold; margin: 0;">
              ${rbl.blacklisted ? `🚨 Reportada en ${rbl.listedIn.length} lista(s) negra(s): ${rbl.listedIn.join(', ')}` : '✅ IP limpia en proveedores RBL'}
            </p>
          </div>
        ` : ''}

        <div style="background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #1f2937;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Recomendaciones Defensivas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
             ${(aiSummary.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      htmlBody = `<h2>Reporte de auditoría estándar</h2>`;
    }

    // Registro de auditoría
    const user = (req as any).user;
    await logAuditEvent({
      userId: user?.id || null,
      userEmail: user?.email || 'guest@qa-sec.local',
      action: 'REPORT_EXPORT',
      module: 'REPORTS',
      details: `Exportación individual módulo: ${moduleType} (${title})`,
      ipAddress: req.ip,
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg-color: #0b0f19;
      --border-color: #1f2937;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --accent-blue: #38bdf8;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      padding: 40px 20px;
      margin: 0;
      line-height: 1.6;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 16px;
    }

    .btn-print {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: white;
      border: 1px solid var(--accent-blue);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.85rem;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
    }

    .method-badge-load {
      background: #1e293b;
      color: #38bdf8;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: bold;
      border: 1px solid #1f2937;
      display: inline-block;
    }

    .code-box-load {
      background: #030712;
      color: #38bdf8;
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #1f2937;
      font-family: monospace;
      font-size: 0.85rem;
      margin: 0;
      overflow-x: auto;
    }

    .empty-box-load {
      background: #030712;
      color: #64748b;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px dashed #1f2937;
      font-size: 0.85rem;
      font-style: italic;
    }

    .bar-container-load {
      display: flex;
      height: 16px;
      border-radius: 6px;
      overflow: hidden;
      background: #1e293b;
      margin-bottom: 12px;
      border: 1px solid #1f2937;
    }

    /* REGLAS EXCLUSIVAS PARA IMPRESIÓN Y PDF EN TAMAÑO CARTA */
    @media print {
      @page {
        size: letter;
        margin: 0;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        background-color: #ffffff !important;
        color: #0f172a !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .container {
        max-width: 100% !important;
        width: 100% !important;
        padding: 15mm !important;
        box-sizing: border-box;
      }

      .no-print {
        display: none !important;
      }

      /* TARJETAS CON BORDE SÚTIL Y FONDO GRIS MUY CLARO */
      div[style*="background"] {
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
      }

      /* FIX CORRECCIÓN ENCABEZADOS DE TABLAS (EASM, WEB, SCA, ETC.) */
      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }

      th, tr[style*="background: #1e293b"], tr[style*="background:#1e293b"] {
        background-color: #f1f5f9 !important;
        color: #0284c7 !important;
        border-bottom: 2px solid #cbd5e1 !important;
        font-weight: bold !important;
      }

      th * {
        color: #0284c7 !important;
      }

      td {
        border-bottom: 1px solid #e2e8f0 !important;
        color: #0f172a !important;
      }

      /* TARJETAS DE MÉTRICAS Y DESGLOSE INDIVIDUAL */
      .load-metrics-grid, .distribution-card-load {
        page-break-inside: avoid !important;
      }

      .metric-card-load {
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
      }

      .metric-label {
        color: #475569 !important;
        font-weight: 600 !important;
      }

      /* ESTILOS DE CAJAS DE ESTADO INDIVIDUALES DEL DESGLOSE HTTP */
      .status-box {
        background: #ffffff !important;
        border-top: 1px solid #cbd5e1 !important;
        border-right: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
      }

      .box-2xx { border-left: 4px solid #16a34a !important; }
      .box-2xx span { color: #15803d !important; }
      .box-2xx strong { color: #16a34a !important; }

      .box-429 { border-left: 4px solid #0284c7 !important; }
      .box-429 span { color: #0369a1 !important; }
      .box-429 strong { color: #0284c7 !important; }

      .box-4xx { border-left: 4px solid #ca8a04 !important; }
      .box-4xx span { color: #a16207 !important; }
      .box-4xx strong { color: #ca8a04 !important; }

      .box-5xx { border-left: 4px solid #dc2626 !important; }
      .box-5xx span { color: #b91c1c !important; }
      .box-5xx strong { color: #dc2626 !important; }

      .box-timeout { border-left: 4px solid #9333ea !important; }
      .box-timeout span { color: #7e22ce !important; }
      .box-timeout strong { color: #9333ea !important; }

      /* PRESERVAR BARRAS DE PROGRESO Y COLORES EXACTOS */
      .bar-container-load {
        background: #e2e8f0 !important;
        border: 1px solid #cbd5e1 !important;
      }

      .bar-segment {
        height: 100% !important;
      }

      .seg-2xx { background-color: #22c55e !important; }
      .seg-429 { background-color: #38bdf8 !important; }
      .seg-4xx { background-color: #facc15 !important; }
      .seg-5xx { background-color: #ef4444 !important; }
      .seg-timeout { background-color: #a855f7 !important; }

      /* SÍNTESIS EXECUTIVE EN VERDE CLARO CON TEXTO OSCURO */
      div[style*="background: rgba(6, 78, 59, 0.2)"],
      div[style*="background:rgba(6,78,59,0.2)"] {
        background: #f0fdf4 !important;
        border: 1px solid #16a34a !important;
      }

      /* FORZAR TEXTOS Y ETIQUETAS A COLOR NEGRO / AZUL OSCURO DE ALTO CONTRASTE */
      h2, h3, h4 {
        color: #0284c7 !important;
      }

      p, li, span, div, strong {
        color: #0f172a !important;
      }

      span[style*="color: #94a3b8"],
      span[style*="color:#94a3b8"] {
        color: #475569 !important;
      }

      /* BADGE DE MÉTODO HTTP EN PRUEBAS DE CARGA */
      .method-badge-load {
        background: #e2e8f0 !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
      }

      /* FIX BADGES DE SEVERIDAD EN IMPRESIÓN */
      span[style*="background: #0f172a"],
      span[style*="background:#0f172a"] {
        background: #e2e8f0 !important;
        color: #0f172a !important;
        border: 1px solid #94a3b8 !important;
      }

      span[style*="#f97316"] {
        background: #ffedd5 !important;
        color: #c2410c !important;
        border: 1px solid #fdba74 !important;
      }

      span[style*="#ef4444"] {
        background: #fee2e2 !important;
        color: #b91c1c !important;
        border: 1px solid #b91c1c !important;
      }

      /* CAJAS DE CÓDIGO, CABECERAS Y PAYLOADS (SERVIDORES Y EVIDENCIAS) */
      pre, code, .code-box-load, .empty-box-load,
      div[style*="background: #030712"], div[style*="background:#030712"] {
        background: #f1f5f9 !important;
        color: #0284c7 !important;
        border: 1px solid #cbd5e1 !important;
        font-style: normal !important;
        font-weight: bold !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar no-print">
      <span style="color: #38bdf8; font-weight: bold; font-size: 0.95rem;">🛡️ QA-Sec Suite — Informe Técnico Individual</span>
      <button class="btn-print" onclick="window.print()">🖨️ Guardar PDF / Imprimir</button>
    </div>
    ${htmlBody}
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.html"`);
    res.status(200).send(fullHtml);
  } catch (error) {
    console.error('[!] Error en exportSingleRecordHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};