export interface SpfRecordResult {
  raw: string | null;
  valid: boolean;
  policy: 'STRICT_FAIL' | 'SOFT_FAIL' | 'NEUTRAL' | 'ALLOW_ALL' | 'MISSING';
  lookupCount: number;
  warnings: string[];
}

export interface DmarcRecordResult {
  raw: string | null;
  valid: boolean;
  policy: 'none' | 'quarantine' | 'reject' | 'MISSING';
  ruaConfigured: boolean;
  alignmentSpf: 'r' | 's';
  alignmentDkim: 'r' | 's';
  warnings: string[];
}

export interface DkimRecordResult {
  selector: string;
  raw: string | null;
  exists: boolean;
  keyLengthBits?: number;
  warnings: string[];
}

export interface RblCheckResult {
  ip: string;
  blacklisted: boolean;
  listedIn: string[];
  cleanIn: string[];
}

export interface HeaderAnalysisResult {
  fromAddress?: string;
  returnPath?: string;
  senderIp?: string;
  spfHeaderStatus?: string;
  dkimHeaderStatus?: string;
  hops: Array<{ hopNumber: number; fromHost: string; byHost: string; ip: string }>;
  isSpoofed: boolean;
  anomalies: string[];
}

export interface EmailSecAuditPayload {
  domain?: string;
  targetIp?: string;
  rawHeaders?: string;
  dkimSelector?: string;
}

export interface EmailSecAuditResponse {
  success: boolean;
  runId: string;
  domain?: string;
  spf?: SpfRecordResult;
  dmarc?: DmarcRecordResult;
  dkim?: DkimRecordResult;
  rbl?: RblCheckResult;
  headerAnalysis?: HeaderAnalysisResult;
  aiSummary: {
    summary: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  };
}