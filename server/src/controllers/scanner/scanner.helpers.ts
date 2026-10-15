import { getAvailableModules } from '../../modules/index.js';
import { saveFinding } from '../../services/findings.service.js';
import { generateUniqueId } from '../../utils/id.generator.js';
import { InterceptedRequest, InterceptedResponse } from '../../core/interceptor.types.js';
import { SummaryFindingInput } from '../../services/gemini.types.js';

export const executeModulesAndSaveFindings = async (
  runId: string,
  targetUrl: string,
  requests: InterceptedRequest[],
  responses: InterceptedResponse[]
) => {
  const modules = getAvailableModules();
  const allFindings = [];

  for (const moduleStrategy of modules) {
    const findings = await moduleStrategy.execute(targetUrl, requests, responses);
    for (const finding of findings) {
      const findingId = generateUniqueId();

      await saveFinding({
        id: findingId,
        test_run_id: runId,
        type: finding.moduleName, 
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        recommendation: finding.recommendation,
        target_url: finding.targetUrl || targetUrl,
        evidence: finding.evidence || null,
        raw_payload: finding.rawPayload,
      } as any);

      allFindings.push(finding);
    }
  }

  return allFindings;
};

export const mapFindingsToSummaryInput = (enrichedFindings: Record<string, unknown>[]): SummaryFindingInput[] => {
  return enrichedFindings.map((f) => ({
    title: String(f.title || ''),
    severity: String(f.severity || 'INFO'),
    description: String(f.description || ''),
  }));
};