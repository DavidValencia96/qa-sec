import { SecurityModuleStrategy, ModuleFinding } from './module.interface.js';
import { InterceptedRequest, InterceptedResponse } from '../core/interceptor.types.js';
import { SECURITY_HEADER_RULES } from './headers.constants.js';
import { GeminiAIService } from '../services/gemini.service.js';

export class HeaderAuditModule implements SecurityModuleStrategy {
  public readonly name = 'Header & TLS Audit';
  public readonly description = 'Evalúa encabezados HTTP obligatorios, fugas de versión y configuraciones avanzadas mediante IA.';

  private geminiService = new GeminiAIService();

  public async execute(
    targetUrl: string,
    _requests: InterceptedRequest[],
    responses: InterceptedResponse[]
  ): Promise<ModuleFinding[]> {
    const mainResponse = this.findMainResponse(targetUrl, responses);
    if (!mainResponse) return [];

    // 1. Evaluación Estática Basada en Reglas OWASP
    const staticFindings = this.analyzeHeaders(mainResponse);

    // 2. Evaluación Dinámica e Inteligente con Gemini AI
    const aiFindings = await this.analyzeHeadersWithAi(mainResponse.url, mainResponse.headers);

    return [...staticFindings, ...aiFindings];
  }

  private findMainResponse(url: string, responses: InterceptedResponse[]): InterceptedResponse | undefined {
    const cleanUrl = url.replace(/\/$/, '');
    return responses.find((res) => res.url.replace(/\/$/, '') === cleanUrl) || responses[0];
  }

  private analyzeHeaders(res: InterceptedResponse): ModuleFinding[] {
    const findings: ModuleFinding[] = [];
    const headers = res.headers;
    const currentUrl = res.url;

    // Faltantes de la lista estándar OWASP
    for (const rule of SECURITY_HEADER_RULES) {
      if (!headers[rule.key]) {
        findings.push({
          moduleName: this.name,
          severity: rule.severity,
          title: rule.title,
          description: `El servidor no retornó el encabezado de seguridad '${rule.key}'.`,
          recommendation: rule.recommendation,
          targetUrl: currentUrl,
        });
      }
    }

    // Fugas de tecnología en Server o X-Powered-By
    if (headers['server'] || headers['x-powered-by']) {
      const tech = headers['x-powered-by'] || headers['server'];
      findings.push({
        moduleName: this.name,
        severity: 'LOW',
        title: 'Fuga de Información Tecnológica en Encabezados',
        description: `El servidor expone la tecnología/versión utilizada: "${tech}".`,
        recommendation: 'Deshabilitar los encabezados "Server" y "X-Powered-By" o remover sus versiones en la configuración de NGINX/Apache/Express.',
        targetUrl: currentUrl,
      });
    }

    // CORS Permisivo
    if (headers['access-control-allow-origin'] === '*') {
      findings.push({
        moduleName: this.name,
        severity: 'HIGH',
        title: 'Configuración CORS Permisiva (Wildcard)',
        description: "El encabezado Access-Control-Allow-Origin está configurado con '*'.",
        recommendation: 'Restringir los orígenes permitidos únicamente a dominios de confianza.',
        targetUrl: currentUrl,
      });
    }

    return findings;
  }

  private async analyzeHeadersWithAi(targetUrl: string, headers: Record<string, string>): Promise<ModuleFinding[]> {
    try {
      const prompt = `
        Actúa como auditor Senior de Seguridad Web. Analiza los siguientes encabezados HTTP obtenidos de ${targetUrl}:
        ${JSON.stringify(headers, null, 2)}

        Identifica problemas adicionales no triviales (ej. banderas de cookies inseguras, valores débiles en CSP o políticas permisivas).
        Responde ÚNICAMENTE con un objeto JSON válido con la estructura:
        {
          "findings": [
            {
              "severity": "HIGH",
              "title": "Título corto del riesgo",
              "description": "Explicación clara del riesgo.",
              "recommendation": "Pasos de mitigación exactos."
            }
          ]
        }
      `;

      // Llamada directa a Gemini AI
      const responseText = await (this.geminiService as any).executeWithFallback('', prompt, 500);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());

      if (parsed?.findings && Array.isArray(parsed.findings)) {
        return parsed.findings.map((f: any) => ({
          moduleName: `${this.name} (IA)`,
          severity: f.severity || 'MEDIUM',
          title: f.title,
          description: f.description,
          recommendation: f.recommendation,
          targetUrl,
        }));
      }
    } catch {
      // Si la IA falla o no encuentra riesgos adicionales, retorna arreglo vacío sin romper la app
    }
    return [];
  }
}