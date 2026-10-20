export function buildEmailSecAnalysisPrompt(
  domain: string,
  spf?: unknown,
  dmarc?: unknown,
  rbl?: unknown,
  headerAnalysis?: unknown
): string {
  return `
    Eres un experto auditor de ciberseguridad especializado en Email Security & Anti-Phishing (OSINT).
    Analiza los siguientes hallazgos técnicos recopilados para el objetivo: "${domain}".

    === RESULTADOS SPF ===
    ${JSON.stringify(spf || 'No evaluado', null, 2)}

    === RESULTADOS DMARC ===
    ${JSON.stringify(dmarc || 'No evaluado', null, 2)}

    === REPUTACIÓN RBL / LISTAS NEGRAS ===
    ${JSON.stringify(rbl || 'No evaluado', null, 2)}

    === ANÁLISIS DE ENCABEZADOS Y SPOOFING ===
    ${JSON.stringify(headerAnalysis || 'No evaluado', null, 2)}

    Responde estrictamente con un JSON en este formato exacto:
    {
    "summary": "Resumen ejecutivo en español detallando los riesgos y vulnerabilidades de suplantación.",
    "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "recommendations": ["Recomendación 1", "Recomendación 2"]
    }
`;
}