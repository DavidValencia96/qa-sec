export interface DnsRecordItem {
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME';
  value: string;
}

export interface SubdomainItem {
  subdomain: string;
  ipAddress?: string;
  status: 'ACTIVE' | 'UNREACHABLE';
}

export interface WafTechnologyDetails {
  wafDetected: boolean;
  wafName?: 'Cloudflare' | 'AWS WAF' | 'Nginx/NAXSI' | 'Akamai' | 'Imperva' | 'Desconocido / Genérico';
  serverHeader?: string;
  detectedTechStack: string[];
}

export interface SslCertificateDetails {
  valid: boolean;
  issuer?: string;
  validTo?: string;
  daysRemaining?: number;
  weakProtocolsDetected: string[];
}

export interface EasmAuditDTO {
  targetDomain: string;
  enableSubdomainDiscovery: boolean;
  enableWafTechDetection: boolean;
  enableSslAudit: boolean;
}

export interface EasmAuditResult {
  runId: string;
  targetDomain: string;
  dnsRecords: DnsRecordItem[];
  subdomains: SubdomainItem[];
  wafAndTech: WafTechnologyDetails;
  sslDetails: SslCertificateDetails;
  aiSummary?: {
    summary: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  };
}