import type { Request, Response } from 'express';
import { ReportFormatterService } from '../services/report/reportFormatter.service.js';
import type { ReportExportRequestDTO } from '../modules/report/reportExport.types.js';

const formatterService = new ReportFormatterService();

export const exportReportHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as ReportExportRequestDTO;

    if (!payload.title || !payload.summary) {
      res.status(400).json({ success: false, error: 'El título y resumen del reporte son requeridos.' });
      return;
    }

    const format = payload.format || 'markdown';
    const safeFileName = payload.title.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (format === 'html') {
      const htmlContent = formatterService.generateHtml(payload);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}_report.html"`);
      res.status(200).send(htmlContent);
      return;
    }

    const markdownContent = formatterService.generateMarkdown(payload);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}_report.md"`);
    res.status(200).send(markdownContent);
  } catch (error) {
    console.error('[!] Error en exportReportHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};