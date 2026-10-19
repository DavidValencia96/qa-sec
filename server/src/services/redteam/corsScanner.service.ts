import type { CorsFinding } from '../../modules/redteam/redteam.types.js';

export class CorsScannerService {
  public async scanCors(targetUrl: string): Promise<CorsFinding[]> {
    const findings: CorsFinding[] = [];
    const urlObj = new URL(targetUrl);

    const testOrigins = [
      'https://evil-attacker.com',
      'null',
      `https://subdomain.${urlObj.hostname}`,
    ];

    for (const origin of testOrigins) {
      const finding = await this.evaluateOrigin(targetUrl, origin);
      if (finding) findings.push(finding);
    }

    return findings;
  }

  private async evaluateOrigin(targetUrl: string, origin: string): Promise<CorsFinding | null> {
    try {
      const response = await fetch(targetUrl, {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'GET',
        },
      });

      const allowedOrigin = response.headers.get('access-control-allow-origin');
      const allowCredentials = response.headers.get('access-control-allow-credentials');

      if (!allowedOrigin) return null;

      const isCredentialsTrue = allowCredentials === 'true';

      if (allowedOrigin === '*' && isCredentialsTrue) {
        return {
          vulnerabilityType: 'ALLOW_ALL_ORIGINS_WITH_CREDENTIALS',
          severity: 'CRITICAL',
          testedOrigin: origin,
          allowedOriginHeader: allowedOrigin,
          allowCredentialsHeader: allowCredentials ?? undefined,
          description: 'Configuración insegura: Access-Control-Allow-Origin wildcard (*) combinado con credenciales habilitadas.',
          remediation: 'No permitir orígenes comodín (*) cuando Access-Control-Allow-Credentials sea true.',
        };
      }

      if (allowedOrigin === origin && isCredentialsTrue) {
        return {
          vulnerabilityType: origin === 'null' ? 'NULL_ORIGIN_ACCEPTED' : 'ARBITRARY_SUBDOMAIN_ACCEPTED',
          severity: 'HIGH',
          testedOrigin: origin,
          allowedOriginHeader: allowedOrigin,
          allowCredentialsHeader: allowCredentials ?? undefined,
          description: `El servidor refleja dinámicamente el origen de confianza no validado "${origin}" permitiendo credenciales.`,
          remediation: 'Implementar una lista blanca estricta (whitelisting) de dominios permitidos para CORS.',
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}