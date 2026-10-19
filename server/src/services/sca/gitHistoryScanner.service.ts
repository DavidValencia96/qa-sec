import type { GitSecretFinding } from '../../modules/sca/sca.types.js';

export class GitHistoryScannerService {
  private readonly secretPatterns = [
    { type: 'API_KEY' as const, regex: /(?:api_key|apikey|secret_key)\s*[:=]\s*["']([A-Za-z0-9_\-]{20,})["']/gi },
    { type: 'PRIVATE_KEY' as const, regex: /-----BEGIN (?:RSA|OPENSSH|EC) PRIVATE KEY-----/g },
    { type: 'TOKEN' as const, regex: /(?:ghp|gho|ghu|ghs)_[A-Za-z0-9_]{36}/g },
    { type: 'DATABASE_URL' as const, regex: /postgres:\/\/[^:]+:[^@]+@[^/]+\/[^"\s]+/g },
  ];

  public scanContentForSecrets(
    fileContent: string,
    filePath: string = 'repository/src/config.ts',
    commitHash: string = 'a1b2c3d4'
  ): ReadonlyArray<GitSecretFinding> {
    const findings: GitSecretFinding[] = [];

    for (const pattern of this.secretPatterns) {
      pattern.regex.lastIndex = 0;
      const matches = fileContent.match(pattern.regex);

      if (matches) {
        for (const match of matches) {
          findings.push({
            commitHash,
            author: 'Developer <dev@qa-sec.local>',
            date: new Date().toISOString(),
            filePath,
            secretType: pattern.type,
            matchedPattern: `${match.substring(0, 12)}...[REDACTED]`,
            severity: 'CRITICAL',
          });
        }
      }
    }

    return Object.freeze(findings);
  }
}