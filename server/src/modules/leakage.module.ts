import { SecurityModuleStrategy, ModuleFinding } from './module.interface.js';
import { InterceptedRequest, InterceptedResponse } from '../core/interceptor.types.js';
import { LEAKAGE_PATTERNS } from './leakage.constants.js';

export class InfoLeakageModule implements SecurityModuleStrategy {
  public readonly name = 'Information Leakage Check';
  public readonly description = 'Inspecciona respuestas HTTP y código cliente buscando credenciales o comentarios.';

  public async execute(
    _targetUrl: string,
    _requests: InterceptedRequest[],
    responses: InterceptedResponse[]
  ): Promise<ModuleFinding[]> {
    const findings: ModuleFinding[] = [];

    for (const response of responses) {
      if (response.body) {
        this.scanResponseBody(response.body, response.url, findings);
      }
    }

    return findings;
  }

  private scanResponseBody(body: string, url: string, findings: ModuleFinding[]): void {
    for (const rule of LEAKAGE_PATTERNS) {
      this.checkPattern(body, url, rule.regex, rule.severity, rule.title, findings);
    }
  }

  private checkPattern(
    body: string,
    url: string,
    regex: RegExp,
    severity: 'CRITICAL' | 'HIGH' | 'LOW',
    title: string,
    findings: ModuleFinding[]
  ): void {
    regex.lastIndex = 0;
    const match = regex.exec(body);

    if (match) {
      findings.push({
        moduleName: this.name,
        severity,
        title,
        description: `Se detectó el patrón "${match[0]}" en el contenido devuelto por la URL.`,
        recommendation: 'Eliminar información sensible, tokens o comentarios de desarrollo del código cliente.',
        targetUrl: url,
        target_url: url,
        evidence: body,
        rawPayload: body,
        raw_payload: body,
      } as ModuleFinding);
    }
  }
}