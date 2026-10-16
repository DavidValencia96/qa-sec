export type CveSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface CveItem {
  id: string;
  publishedAt: string;
  updatedAt: string;
  description: string;
  severity: CveSeverity;
  cvssScore: number;
  referenceUrl?: string;
}

export interface CveAiAnalysis {
  summaryEs: string;
  impactLevel: string;
  mitigationSteps: string[];
  urgency: CveSeverity;
}