export interface GeneratedSuiteConfig {
  suiteName: string;
  selectedModules: string[];
  parameters: Record<string, unknown>;
}

export interface SummaryFindingInput {
  title: string;
  severity: string;
  description: string;
}

export interface DefensivenessSummary {
  executiveSummary: string;
  remediationPriority: string[];
}