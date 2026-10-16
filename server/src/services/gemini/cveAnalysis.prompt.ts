export interface CveAnalysisInput {
  cveId: string;
  severity: string;
  cvssScore: number;
  description: string;
  targetStack?: string;
}

export const buildCveAnalysisPrompt = (data: CveAnalysisInput): string => {
  return `
Eres un analista experto en ciberseguridad y gestión de vulnerabilidades.
Analiza la siguiente vulnerabilidad reportada en la NVD (National Vulnerability Database):

- ID CVE: ${data.cveId}
- Severidad: ${data.severity} (CVSS: ${data.cvssScore})
- Tecnología / Stack Relevante: ${data.targetStack || 'General / Desconocido'}
- Descripción Técnica (Inglés): "${data.description}"

Genera una respuesta estrictamente en formato JSON con la siguiente estructura:
{
  "summaryEs": "Resumen claro y directo en español sobre en qué consiste la vulnerabilidad (máx. 5 oraciones).",
  "impactLevel": "Explicación breve del impacto operativo o de seguridad en el sistema.",
  "mitigationSteps": [
    "Paso 1 de mitigación o parche de seguridad recomendado.",
    "Paso 2 de actualización o configuración defensiva."
  ],
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}
`;
};