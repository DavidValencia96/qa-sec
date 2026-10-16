export interface SastAiInput {
  codeOrContent: string;
  language?: string;
  fileType?: string;
}

export const buildSastAnalysisPrompt = (input: SastAiInput): string => {
  return `
Eres un auditor de ciberseguridad especializado en Análisis Estático de Código (SAST) y OWASP Top 10.
Analiza el siguiente fragmento de código o archivo (${input.language || input.fileType || 'Auto-detect'}):

\`\`\`
${input.codeOrContent}
\`\`\`

Instrucciones de Respuesta:
Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura estricta:
{
  "healthScore": 85, // Número entero entre 0 y 100
  "findings": [
    {
      "severity": "HIGH", // CRITICAL | HIGH | MEDIUM | LOW | INFO
      "title": "Inyección SQL detectada",
      "description": "Explicación clara del problema identificado en el código",
      "lineNumber": 12,
      "recommendation": "Instrucción de cómo corregirlo"
    }
  ],
  "remediatedCode": "Código completo corregido aplicando buenas prácticas de seguridad"
}
`.trim();
};