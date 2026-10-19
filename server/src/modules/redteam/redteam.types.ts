export type JwtVulnerabilityType =
  | 'ALG_NONE_ACCEPTED'
  | 'KEY_CONFUSION_RS256_TO_HS256'
  | 'WEAK_SECRET_BRUTEFORCED'
  | 'EXPIRED_TOKEN_ACCEPTED';

export type CorsVulnerabilityType =
  | 'ALLOW_ALL_ORIGINS_WITH_CREDENTIALS'
  | 'NULL_ORIGIN_ACCEPTED'
  | 'ARBITRARY_SUBDOMAIN_ACCEPTED'
  | 'WILDCARD_ORIGIN_ALLOWED';

export interface JwtFinding {
  vulnerabilityType: JwtVulnerabilityType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  evidenceToken: string;
  remediation: string;
}

export interface CorsFinding {
  vulnerabilityType: CorsVulnerabilityType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  testedOrigin: string;
  allowedOriginHeader?: string;
  allowCredentialsHeader?: string;
  description: string;
  remediation: string;
}

export interface PhishingTemplate {
  id: string;
  title: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  bodyHtml: string;
  targetDepartment?: string;
}

export interface RedTeamAuditPayload {
  targetUrl: string;
  jwtToken?: string;
  publicKeyPem?: string;
  enableJwtScanner: boolean;
  enableCorsExploiter: boolean;
  enablePhishingSimulator: boolean;
  phishingTargetEmails?: string[];
}

export interface RedTeamAuditResponse {
  success: boolean;
  runId: string;
  jwtFindings: JwtFinding[];
  corsFindings: CorsFinding[];
  phishingSimulatedCount: number;
  aiSummary?: {
    summary: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  };
  error?: string;
}