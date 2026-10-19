export type LocatorType = 'id' | 'name' | 'xpath' | 'css';

export interface TargetInput {
  id: string; 
  type: LocatorType;
  value: string; 
}

export type TabType = 'scanner' | 'injection' | 'network' | 'cve' | 'sast' | 'load-test' | 'dast' | 'history';