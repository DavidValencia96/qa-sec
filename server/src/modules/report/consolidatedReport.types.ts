import type { SastFinding } from '../sast/sast.types.js';
import type { LoadTestMetrics } from '../loadTest/loadTest.types.js';

export interface ConsolidatedReportInputDTO {
  title: string;
  projectName: string;
  targetUrl?: string;
  includedModules: {
    webScan?: boolean;
    networkScan?: boolean;
    sastAudit?: boolean;
    loadTest?: boolean;
  };
  webFindings?: Array<{
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    recommendation?: string;
  }>;
  networkData?: {
    targetHost: string;
    openPorts: Array<{ port: number; service: string }>;
    riskAssessment?: string;
  };
  sastData?: {
    fileName: string;
    healthScore: number;
    findings: SastFinding[];
  };
  loadTestData?: {
    targetUrl: string;
    rps: number;
    avgLatencyMs: number;
    metrics: LoadTestMetrics;
  };
  format: 'html' | 'markdown';
}

export interface ConsolidatedExecutiveSummary {
  overallRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  globalHealthScore: number; // 0 - 100
  executiveOverview: string;
  priorityRemediations: string[];
}