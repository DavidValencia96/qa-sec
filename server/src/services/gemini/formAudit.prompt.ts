export interface FormAuditAiInput {
  targetUrl: string;
  selector: string;
  httpStatus: number;
  responseSnippet: string;
}

export function buildFormAuditPrompt(input: FormAuditAiInput): string {
  return `
Eres un experto Senior en QA y Seguridad Web. Analiza la siguiente respuesta HTTP obtenida tras interactuar con un formulario web en un entorno de pruebas autorizadas.

- URL Objetivo: ${input.targetUrl}
- Selector del Campo Auditado: ${input.selector}
- Código de Estado HTTP: ${input.httpStatus}
- Cuerpo/Fragmento de la Respuesta HTTP: "${input.responseSnippet}"

Proporciona un diagnóstico técnico en formato JSON estricto con las siguientes llaves:
{
  "resilienceStatus": "SECURE" | "NEEDS_REVIEW" | "RISK_DETECTED",
  "technicalAnalysis": "Resumen claro y profesional del comportamiento del servidor (máximo 3 oraciones).",
  "recommendedAction": "Recomendación defensiva concreta para los desarrolladores (ej. uso de Prepared Statements, DTOs o sanitización de excepciones)."
}
`;
}