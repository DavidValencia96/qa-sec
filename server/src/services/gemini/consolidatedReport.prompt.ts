import type { ConsolidatedReportInputDTO } from '../../modules/report/consolidatedReport.types.js';

export const buildConsolidatedReportPrompt = (data: ConsolidatedReportInputDTO): string => {
  return `
Eres un CISO (Chief Information Security Officer) y Auditor Senior de Ciberseguridad.
Evalúa de manera holística la postura defensiva del sistema basándote en los datos recolectados de múltiples vectores de prueba:

- Proyecto: ${data.projectName}
- URL u Host Objetivo: ${data.targetUrl || 'N/A'}
- Módulos auditados en esta ejecución: ${Object.keys(data.includedModules).filter((k) => (data.includedModules as any)[k]).join(', ')}

[DATOS AUDITORÍA WEB / PLAYWRIGHT]:
${data.webFindings ? JSON.stringify(data.webFindings, null, 2) : 'No incluido o sin hallazgos.'}

[DATOS AUDITORÍA DE RED]:
${data.networkData ? JSON.stringify(data.networkData, null, 2) : 'No incluido.'}

[DATOS AUDITORÍA ESTÁTICA CÓDIGO (SAST)]:
${data.sastData ? `Score: ${data.sastData.healthScore}, Archivo: ${data.sastData.fileName}, Hallazgos:${data.sastData.findings.length}` : 'No incluido.'}

[DATOS PRUEBAS DE ESTRÉS / CARGA (DoS)]:
${data.loadTestData ? `RPS: ${data.loadTestData.rps}, Latencia Promedio: ${data.loadTestData.avgLatencyMs}ms, Total Peticiones:${data.loadTestData.metrics.totalRequests}` : 'No incluido.'}

Genera una evaluación estratégica integral de ciberseguridad.
RESPONDE ÚNICAMENTE EN FORMATO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA ESTRICTA:
{
  "overallRiskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "globalHealthScore": 85, // Número entero entre 0 y 100
  "executiveOverview": "Síntesis técnica y estratégica en español evaluando el estado general del sistema...",
  "priorityRemediations": [
    "Acción correctiva urgente 1",
    "Acción correctiva urgente 2",
    "Acción correctiva urgente 3"
  ]
}
`.trim();
};