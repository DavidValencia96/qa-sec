import { GeneratedSuiteConfig, DefensivenessSummary } from '../gemini.types.js';

export const DEFAULT_SUITE_CONFIG: GeneratedSuiteConfig = {
  suiteName: 'Suite de Pruebas OWASP (Seguridad QA)',
  selectedModules: ['Header & TLS Audit', 'Sensitive Exposure Check', 'Information Leakage Check'],
  parameters: {},
};

export const DEFAULT_EXECUTIVE_SUMMARY: DefensivenessSummary = {
  executiveSummary: 'Se han completado las pruebas de seguridad automatizadas en la aplicación objetivo.',
  remediationPriority: ['Revisar detalles técnicos de hallazgos en el reporte.'],
};

export const SYSTEM_PROMPT_SUITE_GENERATION = `
  Eres un asistente experto en QA y pruebas de seguridad web.
  El usuario te describirá un escenario de prueba. Debes responder EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura:
  {
    "suiteName": "Nombre corto de la suite",
    "selectedModules": ["Header & TLS Audit", "Sensitive Exposure Check", "Information Leakage Check"],
    "parameters": {}
  }
`;

export const getExecutiveSummaryPrompt = (findings: unknown[]): string => `
  Analiza la siguiente lista de hallazgos de seguridad detectados durante una prueba de QA:
  ${JSON.stringify(findings, null, 2)}

  Responde EXCLUSIVAMENTE con un objeto JSON válido, sin bloques de código markdown (\`\`\`json) ni texto explicativo adicional.
  Estructura requerida:
  {
    "executiveSummary": "Un párrafo claro y directo en español analizando el impacto global de estos hallazgos en la aplicación.",
    "remediationPriority": [
      "Paso 1 prioritario para corregir la vulnerabilidad de mayor riesgo",
      "Paso 2 prioritario",
      "Paso 3 opcional"
    ]
  }
`;

export const getEnrichFindingsPrompt = (findings: unknown[]): string => `
  Eres un experto en ciberseguridad y Pentesting. 
  Analiza la siguiente lista de hallazgos técnicos detectados y genera para CADA UNO una recomendación de mitigación (mitigation) clara, técnica y específica en español.

  Hallazgos:
  ${JSON.stringify(findings, null, 2)}

  Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
  {
    "mitigations": [
      {
        "id": "ID del hallazgo",
        "recommendation": "Pasos técnicos exactos para solucionar la vulnerabilidad."
      }
    ]
  }
`;

export const getNetworkConfigPrompt = (targetHost: string, openServices: unknown[]): string => `
  Como consultor defensivo de ciberseguridad, analiza la siguiente lista de servicios y puertos ABIERTOS detectados en el host objetivo "${targetHost}":
  ${JSON.stringify(openServices, null, 2)}

  Responde EXCLUSIVAMENTE con un objeto JSON válido con la siguiente estructura:
  {
    "riskAssessment": "Evaluación clara en español sobre la superficie de ataque y riesgos derivados de estos puertos abiertos.",
    "mitigations": [
      {
        "port": 80,
        "recommendation": "Instrucción técnica precisa o regla de firewall (iptables/ufw/nginx) para mitigar el riesgo."
      }
    ]
  }
`;

export const INPUT_SANITIZATION_AUDIT_PROMPT = `
Eres un auditor experto en ciberseguridad defensiva y sanitización de datos.
Analiza la siguiente respuesta recibida desde una aplicación web tras evaluar un parámetro de entrada en un formulario.

Detalles del Campo Auditado:
- Selector: {{SELECTOR_TYPE}} = {{SELECTOR_VALUE}}
- Respuesta HTTP / HTML / Error detectado: {{HTTP_RESPONSE}}

Por favor realiza la evaluación defensiva:
1. Identifica si la respuesta expone mensajes de error internos de base de datos (por ejemplo, errores de sintaxis MySQL, PostgreSQL, Oracle).
2. Determina si el campo carece de sanitización adecuada o validación de tipos en el servidor.
3. Proporciona recomendaciones precisas en Node.js/MySQL (como el uso de Sentencias Preparadas o Parametrización de Consultas) para remediar cualquier punto vulnerable.
`;