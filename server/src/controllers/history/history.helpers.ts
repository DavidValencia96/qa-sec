export interface FormattedHistoryRun {
  runId: string;
  auditType: 'WEB_AUDIT' | 'NETWORK_AUDIT';
  status: string;
  startedAt: string;
  finishedAt: string | null;
  suiteName: string;
  promptInput: string | null;
  projectName: string;
  targetUrl: string;
  totalFindings: number;
}

export const formatHistoryRecords = (rawHistory: any[]): FormattedHistoryRun[] => {
  return rawHistory.map((item) => ({
    runId: String(item.runId),
    auditType: item.auditType,
    status: item.status || 'UNKNOWN',
    startedAt: item.startedAt,
    finishedAt: item.finishedAt || null,
    suiteName: item.suiteName || 'Sin Nombre',
    promptInput: item.promptInput || null,
    projectName: item.projectName || 'General',
    targetUrl: item.targetUrl || 'N/A',
    totalFindings: Number(item.totalFindings || 0),
  }));
};