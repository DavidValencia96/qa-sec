import type { LoadTestMetrics, LoadTestConfigDTO } from '../../modules/loadTest/loadTest.types.js';

export const buildLoadTestAnalysisPrompt = (
  config: LoadTestConfigDTO,
  metrics: LoadTestMetrics
): string => {
  return `
Eres un Experto en Ciberseguridad e Ingeniería de Desempeño OWASP (API4:2023 - Consumo Desmedido de Recursos / DoS).
Analiza las siguientes métricas obtenidas tras un análisis de estrés en tiempo real:

- URL Objetivo: ${config.targetUrl}
- Método HTTP: ${config.method}
- Nivel de Concurrencia: ${config.concurrency} clientes simultáneos
- Duración del Ataque Simulado: ${config.durationSeconds} segundos
- Total de Peticiones Enviadas: ${metrics.totalRequests}
- Peticiones por Segundo (RPS): ${metrics.requestsPerSecond}
- Latencia Promedio: ${metrics.avgLatencyMs} ms (Máxima: ${metrics.maxLatencyMs} ms, p95: ${metrics.p95LatencyMs} ms)
- Desglose de Respuestas HTTP:
  * Exitosas (2xx): ${metrics.statusBreakdown.status2xx}
  * Error Cliente (4xx): ${metrics.statusBreakdown.status4xx}
  * Rate Limited (429 Too Many Requests): ${metrics.statusBreakdown.status429RateLimited}
  * Error Servidor / Caídas (5xx): ${metrics.statusBreakdown.status5xx}
  * Timeouts / Bloqueo de Event Loop: ${metrics.statusBreakdown.timeouts}

RESPONDE ÚNICAMENTE EN FORMATO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA ESTRICTA:
{
  "rateLimitingProtection": "EXCELLENT" | "WEAK" | "CRITICAL_MISSING",
  "summary": "Evaluación ejecutiva en español de la resiliencia del servidor bajo estas condiciones de carga.",
  "recommendations": [
    "Recomendación técnica específica 1 (ej. Express-rate-limit, Nginx burst limit, Caching)",
    "Recomendación técnica específica 2"
  ]
}
`.trim();
};