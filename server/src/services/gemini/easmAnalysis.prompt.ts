export function buildEasmAnalysisPrompt(easmData: {
  cleanDomain: string;
  dnsRecords: any[];
  subdomains: any[];
  wafAndTech: any;
  sslDetails: any;
}): string {
  return `
Eres un consultor experto en ciberseguridad especializado en External Attack Surface Management (EASM) y OSINT.
Analiza la siguiente información de superficie de ataque expuesta a Internet para el dominio "${easmData.cleanDomain}":

- Registros DNS Detectados: ${JSON.stringify(easmData.dnsRecords)}
- Subdominios Activos Descubiertos: ${JSON.stringify(easmData.subdomains)}
- WAF y Tecnologías Expuestas: ${JSON.stringify(easmData.wafAndTech)}
- Auditoría de Certificado SSL/TLS: ${JSON.stringify(easmData.sslDetails)}

Genera un diagnóstico técnico y defensivo en un objeto JSON estricto con las siguientes claves:
{
  "summary": "Resumen ejecutivo profesional en español sobre la postura de seguridad externa.",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "recommendations": ["Recomendación 1", "Recomendación 2", "Recomendación 3"]
}
`.trim();
}