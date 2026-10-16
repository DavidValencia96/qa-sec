export interface CveAiAnalysisResult {
  summaryEs: string;
  impactLevel: string;
  mitigationSteps: string[];
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}