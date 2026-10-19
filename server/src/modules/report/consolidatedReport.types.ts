import type { SastFinding } from '../sast/sast.types.js';
import type { LoadTestMetrics } from '../loadTest/loadTest.types.js';
import type { DastFinding } from '../dast/dast.types.js';
import type { ScaVulnerability, GitSecretFinding } from '../sca/sca.types.js';
import type { DnsRecordItem, SubdomainItem, WafTechnologyDetails, SslCertificateDetails } from '../easm/easm.types.js';
import type { JwtFinding, CorsFinding } from '../redteam/redteam.types.js';

export interface ConsolidatedReportInputDTO {
  title: string;
  projectName: string;
  targetUrl?: string;
  includedModules: {
    webScan?: boolean;
    networkScan?: boolean;
    sastAudit?: boolean;
    loadTest?: boolean;
    dastAudit?: boolean;
    scaAudit?: boolean;
    easmAudit?: boolean;
    redTeamAudit?: boolean;
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
  dastData?: {
    targetBaseUrl: string;
    totalTestedEndpoints: number;
    findings: DastFinding[];
    aiSummary?: {
      summary: string;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      recommendations: string[];
    };
  };
  scaData?: {
    manifestType: string;
    totalDependenciesAudited: number;
    vulnerabilities: ScaVulnerability[];
    gitSecrets: GitSecretFinding[];
    aiSummary?: {
      summary: string;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      recommendations: string[];
    };
  };
  easmData?: {
    targetDomain: string;
    dnsRecords: DnsRecordItem[];
    subdomains: SubdomainItem[];
    wafAndTech: WafTechnologyDetails;
    sslDetails: SslCertificateDetails;
    aiSummary?: {
      summary: string;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      recommendations: string[];
    };
  };
  redTeamData?: {
    targetUrl: string;
    jwtToken?: string;
    jwtFindings: JwtFinding[];
    corsFindings: CorsFinding[];
    phishingSimulatedCount: number;
    aiSummary?: {
      summary: string;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      recommendations: string[];
    };
  };
  format: 'html' | 'markdown';
}

export interface ConsolidatedExecutiveSummary {
  overallRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  globalHealthScore: number; // 0 - 100
  executiveOverview: string;
  priorityRemediations: string[];
}