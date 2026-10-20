export type CliModuleType = 'web' | 'sast' | 'load' | 'dast' | 'sca' | 'easm' | 'redteam' | 'all';

export type RiskThreshold = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CliArguments {
  targetUrl?: string;
  module: CliModuleType;
  jwtToken?: string;
  threshold: RiskThreshold;
  outputFormat: 'json' | 'html' | 'text';
  outputPath?: string;
  failOnViolation: boolean;
  verbose: boolean;
}

export interface CliExecutionResult {
  success: boolean;
  violationDetected: boolean;
  highestSeverity: RiskThreshold | 'NONE';
  summary: string;
  details: unknown;
}