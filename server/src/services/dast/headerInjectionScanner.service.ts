import type { DastFinding } from '../../modules/dast/dast.types.js';

export class HeaderInjectionScannerService {
  public async auditHeaderInjections(targetUrl: string): Promise<ReadonlyArray<DastFinding>> {
    const findings: DastFinding[] = [];

    const hostInjectionFinding = await this.testHostHeaderInjection(targetUrl);
    if (hostInjectionFinding) findings.push(hostInjectionFinding);

    const crlfFinding = await this.testCrlfInjection(targetUrl);
    if (crlfFinding) findings.push(crlfFinding);

    return Object.freeze(findings);
  }

  private async testHostHeaderInjection(targetUrl: string): Promise<DastFinding | null> {
    try {
      const spoofedHost = 'evil-attacker.com';
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { Host: spoofedHost },
      });

      const locationHeader = response.headers.get('location') || '';
      if (locationHeader.includes(spoofedHost)) {
        return {
          vulnerabilityType: 'HOST_HEADER_INJECTION',
          severity: 'HIGH',
          endpointPath: targetUrl,
          httpMethod: 'GET',
          description: 'El servidor refleja cabeceras Host manipuladas en redirecciones o enlaces de respuesta.',
          remediation: 'Validar la cabecera Host contra una lista blanca en el proxy inverso o servidor web.',
          evidencePayload: `Host: ${spoofedHost} -> Location: ${locationHeader}`,
        };
      }
    } catch {
      // Ignorar fallos de red en fuzzing controlado
    }
    return null;
  }

  private async testCrlfInjection(targetUrl: string): Promise<DastFinding | null> {
    try {
      const crlfPayload = 'test%0d%0aSet-Cookie:%20qasec_injected=true';
      const response = await fetch(`${targetUrl}?q=${crlfPayload}`, { method: 'GET' });

      const setCookieHeader = response.headers.get('set-cookie') || '';
      if (setCookieHeader.includes('qasec_injected=true')) {
        return {
          vulnerabilityType: 'CRLF_INJECTION',
          severity: 'HIGH',
          endpointPath: targetUrl,
          httpMethod: 'GET',
          description: 'Inyección de caracteres de retorno de carro y salto de línea (%0d%0a) permitida en encabezados HTTP.',
          remediation: 'Sanitizar y desinfectar todos los parámetros de entrada eliminando secuencias \\r y \\n.',
          evidencePayload: `Payload: ${crlfPayload}`,
        };
      }
    } catch {
      // Ignorar fallos de red
    }
    return null;
  }
}