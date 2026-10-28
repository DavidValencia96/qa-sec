export interface HistoryItem {
  runId: string;
  auditType?: 'WEB_AUDIT' | 'NETWORK_AUDIT';
  status: string;
  startedAt: string;
  finishedAt: string | null;
  suiteName: string | null;
  promptInput: string | null;
  projectName: string | null;
  targetUrl: string | null;
  totalFindings: number;
  testerEmail?: string;
}