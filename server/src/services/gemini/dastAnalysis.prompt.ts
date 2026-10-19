import type { DastFinding } from '../../modules/dast/dast.types.js';

export const buildDastAnalysisPrompt = (
  targetBaseUrl: string,
  totalTestedEndpoints: number,
  findings: ReadonlyArray<DastFinding>
): string => {
  return `
Eres un experto en Ciberseguridad Pentesting y Auditoría DAST / API Security.
Analiza los siguientes resultados obtenidos de una auditoría dinámica (OWASP API Security Top 10):

- URL Base Evaluada: ${targetBaseUrl}
- Total Endpoints Analizados: ${totalTestedEndpoints}
- Hallazgos Detectados: ${JSON.stringify(findings, null, 2)}

Proporciona un diagnóstico en formato JSON estructurado con el siguiente esquema exacto:
{
  "summary": "Resumen ejecutivo del estado de seguridad DAST (máximo 3 oraciones).",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "recommendations": ["Recomendación técnica 1", "Recomendación técnica 2"]
}
Responde estrictamente con el JSON sin bloques de texto adicionales.
  `.trim();
};