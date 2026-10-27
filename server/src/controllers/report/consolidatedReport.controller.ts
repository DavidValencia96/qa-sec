import type { Request, Response } from 'express';
import { GeminiAIService } from '../../services/gemini.service.js';
import { ConsolidatedReportFormatterService } from '../../services/report/consolidatedReportFormatter.service.js';
import type { ConsolidatedReportInputDTO } from '../../modules/report/consolidatedReport.types.js';
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

    // 1. Consultar últimos datos de DAST si está activado
    if (data.includedModules?.dastAudit) {
      const [dastRows]: any = await pool.query(
        'SELECT * FROM dast_history ORDER BY created_at DESC LIMIT 1'
      );
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

    // 2. Consultar últimos datos de SCA si está activado
    if (data.includedModules?.scaAudit) {
      const [scaRows]: any = await pool.query(
        'SELECT * FROM sca_history ORDER BY created_at DESC LIMIT 1'
      );
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

    // 3. Consultar últimos datos de EASM si está activado
    if (data.includedModules?.easmAudit) {
      const [easmRows]: any = await pool.query(
        'SELECT * FROM easm_history ORDER BY created_at DESC LIMIT 1'
      );
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

    // 4. Diagnóstico Global con Gemini AI
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

    // 5. Generar informe según formato deseado (HTML o Markdown)
    if (data.format === 'markdown') {
      const markdownContent = formatterService.generateMarkdownReport(data, aiSummary);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="informe_consolidado_${data.projectName.toLowerCase().replace(/\s+/g, '_')}.md"`);
      res.status(200).send(markdownContent);
      return;
    }

    // Formato por defecto: HTML Corporativo
    const htmlContent = formatterService.generateHtmlReport(data, aiSummary);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="informe_consolidado_${data.projectName.toLowerCase().replace(/\s+/g, '_')}.html"`);
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('[!] Error en exportConsolidatedReportHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};