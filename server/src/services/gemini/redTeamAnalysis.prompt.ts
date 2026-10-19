import type { JwtFinding, CorsFinding } from '../../modules/redteam/redteam.types.js';

export const buildRedTeamAnalysisPrompt = (
  targetUrl: string,
  jwtFindings: JwtFinding[],
  corsFindings: CorsFinding[],
  phishingCount: number
): string => {
  return `Actúa como un experto Pentester Senior / Red Team Lead. Analiza los resultados de explotación para el objetivo: "${targetUrl}".

Hallazgos JWT (${jwtFindings.length}):
${JSON.stringify(jwtFindings, null, 2)}

Hallazgos CORS (${corsFindings.length}):
${JSON.stringify(corsFindings, null, 2)}

Simulaciones de Phishing Preparadas: ${phishingCount}

Responde estrictamente en formato JSON válido con la siguiente estructura:
{
  "summary": "Resumen ejecutivo claro de la postura de explotación del objetivo",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "recommendations": [
    "Recomendación estratégica 1",
    "Recomendación estratégica 2"
  ]
}`;
};