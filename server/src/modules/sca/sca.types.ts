export type DependencyManifestType = 'package_json' | 'requirements_txt' | 'pom_xml';

export interface ScaVulnerability {
  readonly packageName: string;
  readonly currentVersion: string;
  readonly cveId?: string;
  readonly severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  readonly description: string;
  readonly patchedVersion?: string;
  readonly licenseType?: string;
  readonly isLicenseIncompatible: boolean;
}

export interface GitSecretFinding {
  readonly commitHash: string;
  readonly author: string;
  readonly date: string;
  readonly filePath: string;
  readonly secretType: 'API_KEY' | 'PRIVATE_KEY' | 'DATABASE_URL' | 'TOKEN';
  readonly matchedPattern: string;
  readonly severity: 'CRITICAL' | 'HIGH';
}

export interface ScaAuditConfigDTO {
  readonly manifestType?: DependencyManifestType;
  readonly manifestContent?: string;
  readonly gitRepositoryPath?: string;
  readonly enableDependencyScan: boolean;
  readonly enableGitHistoryScan: boolean;
}

export interface ScaAuditResult {
  readonly runId: string;
  readonly totalDependenciesAudited: number;
  readonly vulnerabilities: ReadonlyArray<ScaVulnerability>;
  readonly gitSecrets: ReadonlyArray<GitSecretFinding>;
  readonly aiSummary?: {
    readonly summary: string;
    readonly riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    readonly recommendations: ReadonlyArray<string>;
  };
}