import type { OpenApiEndpointDefinition, DastFinding } from '../../modules/dast/dast.types.js';

export class BolaScannerService {
  public async auditEndpointForBola(
    baseUrl: string,
    endpoint: OpenApiEndpointDefinition,
    primaryAuthToken: string,
    secondaryAuthToken: string
  ): Promise<DastFinding | null> {
    if (!this.containsResourceIdentifier(endpoint.path)) {
      return null;
    }

    const testUrl = this.buildTestUrl(baseUrl, endpoint.path);
    const primaryResponseStatus = await this.executeRequest(testUrl, endpoint.method, primaryAuthToken);
    const secondaryResponseStatus = await this.executeRequest(testUrl, endpoint.method, secondaryAuthToken);

    const isUnauthorizedAccessAllowed = primaryResponseStatus === 200 && secondaryResponseStatus === 200;

    if (!isUnauthorizedAccessAllowed) {
      return null;
    }

    return {
      vulnerabilityType: 'BOLA_IDOR',
      severity: 'CRITICAL',
      endpointPath: endpoint.path,
      httpMethod: endpoint.method,
      description: 'Acceso no autorizado detectado al intercambiar identificadores de recursos entre diferentes usuarios (OWASP API1:2023).',
      remediation: 'Implementar controles de acceso a nivel de objeto basados en el contexto de la sesión verificada en la capa de servicios.',
      evidencePayload: `Primary Token Status: ${primaryResponseStatus} | Secondary Token Status: ${secondaryResponseStatus}`,
    };
  }

  private containsResourceIdentifier(path: string): boolean {
    return path.includes('{id}') || path.includes(':id') || /\/(\d+)/.test(path);
  }

  private buildTestUrl(baseUrl: string, path: string): string {
    const normalizedPath = path.replace('{id}', '1').replace(':id', '1');
    return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
  }

  private async executeRequest(url: string, method: string, authToken: string): Promise<number> {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
          'User-Agent': 'QA-Sec-Suite-DAST/1.0',
        },
      });
      return response.status;
    } catch {
      return 500;
    }
  }
}