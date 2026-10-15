export interface ProjectEntity {
  id: string;
  name: string;
  target_url: string;
  description?: string;
  created_at?: Date;
}

export interface TestSuiteEntity {
  id: string;
  project_id: string;
  name: string;
  modules_config: Record<string, unknown>;
  created_by?: string;
  created_at?: Date;
}

export type RunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface TestRunEntity {
  id: string;
  test_suite_id: string;
  status: RunStatus;
  started_at?: Date;
  finished_at?: Date | null;
}

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface FindingEntity {
  id: string;
  test_run_id: string;
  module_name: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  recommendation: string;
  target_url?: string | null; 
  evidence?: string | null;   
  raw_payload?: Record<string, unknown> | string | null;
  created_at?: Date;
}