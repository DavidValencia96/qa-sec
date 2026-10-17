import type { Request, Response } from 'express';
import { GeminiAIService } from '../../services/gemini.service.js';
import { ConsolidatedReportFormatterService } from '../../services/report/consolidatedReportFormatter.service.js';
import type { ConsolidatedReportInputDTO } from '../../modules/report/consolidatedReport.types.js';

const geminiService = new GeminiAIService();
const formatterService = new ConsolidatedReportFormatterService();

export const exportConsolidatedReportHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as ConsolidatedReportInputDTO;

    if (!data.projectName) {
      res.status(400).json({ success: false, error: 'El nombre del proyecto (projectName) es requerido.' });
      return;
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