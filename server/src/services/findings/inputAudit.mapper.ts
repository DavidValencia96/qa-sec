import { AuditResult } from '../../core/runner/inputAudit.evaluator.js';
import { generateUniqueId } from '../../utils/id.generator.js';

export function buildFindingFromAudit(runId: string, targetUrl: string, res: AuditResult) {
  const isError = res.status === 'SUSPICIOUS_ERROR' || res.httpStatus >= 500;
  
  return {
    id: generateUniqueId(),
    test_run_id: runId,
    type: isError ? 'FORM_SANITY_WARNING' : 'FORM_SANITY_VERIFIED',
    severity: isError ? 'MEDIUM' : 'INFO',
    title: `[${res.testType}] Campo: ${res.selector}`,
    description: `• Test: ${res.testType}\n• Localizador [${res.type.toUpperCase()}]: ${res.selector}\n• Entrada: ${res.payloadUsed}\n• Estado HTTP: ${res.httpStatus}\n• Resultado: ${res.detail}`,
    recommendation: isError
      ? 'Implementar validación estricta de entradas en el servidor, DTOs y consultas parametrizadas.'
      : 'Mantener el uso de consultas parametrizadas (Prepared Statements) y validación de tipos en el backend.',
    target_url: targetUrl,
    evidence: `Entrada: "${res.payloadUsed}" | Estado HTTP: ${res.httpStatus}`,
    raw_payload: JSON.stringify(res)
  };
}