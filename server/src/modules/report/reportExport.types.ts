export type ExportFormat = 'pdf' | 'html' | 'markdown';

export interface ReportExportRequestDTO {
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
  format: ExportFormat;
}