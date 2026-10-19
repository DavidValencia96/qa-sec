import type { Request, Response } from 'express';
import { GeminiAIService } from '../../services/gemini.service.js';
import { ConsolidatedReportFormatterService } from '../../services/report/consolidatedReportFormatter.service.js';
import type { ConsolidatedReportInputDTO } from '../../modules/report/consolidatedReport.types.js';
import { getDbPool } from '../../config/database.js';

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

    // Consultar últimos datos de DAST si está activado
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

    // Consultar últimos datos de SCA si está activado
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

    // 1. Diagnóstico Global con Gemini AI
    const aiSummary = await geminiService.generateConsolidatedExecutiveSummary(data);

    // 2. Generar informe según formato deseado (HTML o Markdown)
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