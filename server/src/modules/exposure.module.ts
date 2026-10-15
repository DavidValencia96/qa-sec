import { SecurityModuleStrategy, ModuleFinding } from './module.interface.js';
import { InterceptedRequest, InterceptedResponse } from '../core/interceptor.types.js';
import { SENSITIVE_PATHS } from './exposure.constants.js';

export class SensitiveExposureModule implements SecurityModuleStrategy {
  public readonly name = 'Sensitive Exposure Check';
  public readonly description = 'Verifica si existen archivos sensibles expuestos en rutas conocidas.';

  public async execute(
    targetUrl: string,
    _requests: InterceptedRequest[],
    responses: InterceptedResponse[]
  ): Promise<ModuleFinding[]> {
    const findings: ModuleFinding[] = [];
    const baseUrl = targetUrl.replace(/\/$/, '');

    for (const response of responses) {
      for (const path of SENSITIVE_PATHS) {
        const fullPathUrl = `${baseUrl}${path}`;

        if (response.url.endsWith(path) || response.url === fullPathUrl) {
          if (response.status === 200) {
            findings.push({
              moduleName: this.name,
              severity: path.includes('robots') ? 'INFO' : 'CRITICAL',
              title: `Archivo/Ruta ${path} Detectado`,
              description: `Se obtuvo acceso público exitoso a la ruta: ${path}`,
              recommendation: `Restringir inmediatamente los permisos de acceso web para ${path}.`,
              targetUrl: fullPathUrl,
              evidence: response.body ? response.body.substring(0, 150) : undefined,
              rawPayload: response.body || undefined,
            });
          }
        }
      }
    }

    return findings;
  }
}