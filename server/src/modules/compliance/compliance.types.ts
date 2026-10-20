export type StandardType = 'OWASP_2021' | 'ISO27001' | 'NIST_800_53';

export interface ComplianceControlStatus {
  controlId: string;
  title: string;
  category: string;
  status: 'PASSED' | 'FAILED' | 'PARTIAL';
  failingFindingsCount: number;
  mappedSources: string[];
  findingsDetails: Array<{
    sourceModule: string;
    title: string;
    severity: string;
    recommendation?: string;
  }>;
}

export interface StandardComplianceSummary {
  standard: StandardType;
  standardName: string;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  compliancePercentage: number;
  controls: ComplianceControlStatus[];
}

export interface ComplianceRadarResponse {
  success: boolean;
  overallComplianceScore: number;
  standards: Record<StandardType, StandardComplianceSummary>;
  aiExecutiveSummary: {
    summary: string;
    priorityActionPlan: string[];
  };
}