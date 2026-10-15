export interface FindingDetail {
  findingId?: string;
  moduleName?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  recommendation: string;
  targetUrl?: string;
  evidence?: string;
  rawPayload?: unknown;
  findingTime?: string;
  runStatus?: string;
  startedAt?: string;
  finishedAt?: string;
  suiteName?: string;
  promptInput?: string;
  projectName?: string;
  projectTargetUrl?: string;
}

export interface ReportData {
  runId: string;
  findingsCount: number;
  findings: FindingDetail[];
  aiSummary?: {
    executiveSummary: string;
    remediationPriority: string[];
  };
}