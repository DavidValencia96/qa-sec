export interface SuiteConfig {
  suiteName: string;
  selectedModules: string[];
  parameters: Record<string, unknown>;
}