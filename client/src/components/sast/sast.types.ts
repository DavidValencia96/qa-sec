export type SastFindingType = 'SECRET_EXPOSED' | 'VULNERABLE_DEPENDENCY' | 'CODE_VULNERABILITY';
export type SastSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface SastFinding {
  id: string;
  type: SastFindingType;
  severity: SastSeverity;
  ruleId: string;
  title: string;
  description: string;
  lineNumber?: number;
  snippet?: string;
  recommendation: string;
}

export interface SastAnalysisResponse {
  success: boolean;
  score: number;
  totalFindings: number;
  findings: SastFinding[];
  remediatedCode?: string;
  analyzedAt: string;
}