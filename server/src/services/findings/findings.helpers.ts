import { FindingEntity } from '../db.types.js';

export type ExtendedFindingInput = FindingEntity & {
  targetUrl?: string;
  rawPayload?: unknown;
};

export const normalizeFindingPayload = (finding: ExtendedFindingInput) => {
  // 1. Target URL (camelCase o snake_case)
  const targetUrlValue = finding.target_url || finding.targetUrl || null;

  // 2. Evidencia
  let evidenceValue: string | null = null;
  if (finding.evidence) {
    evidenceValue = typeof finding.evidence === 'string'
      ? finding.evidence
      : JSON.stringify(finding.evidence);
  }

  // 3. Raw Payload
  const payloadInput = finding.raw_payload ?? finding.rawPayload;
  let formattedPayload: string | null = null;

  if (payloadInput) {
    if (typeof payloadInput === 'string') {
      try {
        JSON.parse(payloadInput);
        formattedPayload = payloadInput;
      } catch {
        formattedPayload = JSON.stringify({ content: payloadInput });
      }
    } else {
      formattedPayload = JSON.stringify(payloadInput);
    }
  }

  return {
    targetUrlValue,
    evidenceValue,
    formattedPayload,
  };
};