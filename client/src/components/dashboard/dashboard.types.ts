export type LocatorType = 'id' | 'name' | 'xpath' | 'css';

export interface TargetInput {
  id: string; 
  type: LocatorType;
  value: string;
  name: string; 
  selector: string;
}

export type TabType =
  | 'home'
  | 'scanner'
  | 'injection'
  | 'network'
  | 'cve'
  | 'sast'
  | 'load-test'
  | 'dast'
  | 'sca'
  | 'easm'
  | 'redteam'
  | 'emailsec'
  | 'compliance'
  | 'history'
  | 'admin';