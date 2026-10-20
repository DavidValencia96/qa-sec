export function buildComplianceAnalysisPrompt(score: number, standards: unknown): string {
  return `
Eres un auditor líder de Ciberseguridad y Cumplimiento Normativo (ISO 27001 / OWASP Top 10 / NIST SP 800-53).
Analiza las siguientes métricas de cumplimiento consolidado para la organización:

- Score Global de Cumplimiento: ${score}%
- Resumen por Estándares y Controles Evaluados:
${JSON.stringify(standards, null, 2)}

Proporciona un diagnóstico conciso en formato JSON con la siguiente estructura exacta:
{
  "summary": "Resumen ejecutivo en español con el dictamen de postura de cumplimiento y brechas principales identificadas.",
  "priorityActionPlan": [
    "Acción preventiva/remedial 1",
    "Acción preventiva/remedial 2",
    "Acción preventiva/remedial 3"
  ]
}
`;
}