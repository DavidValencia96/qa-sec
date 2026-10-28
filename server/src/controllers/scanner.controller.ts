import { Request, Response } from 'express';
import { getDbPool } from '../config/database.js';
import { runAnalysisSession, executeInputAuditRunner } from '../core/runner.js';
import { type TargetSelector } from '../core/runner/runner.helpers.js';
import { getFindingsByRunId, saveFinding } from '../services/findings.service.js';
import { buildFindingFromAudit } from '../services/findings/inputAudit.mapper.js';
import { GeminiAIService } from '../services/gemini.service.js';
import { generateUniqueId } from '../utils/id.generator.js';
import { RunTestDTO } from './api.types.js';
import { executeModulesAndSaveFindings, mapFindingsToSummaryInput } from './scanner/scanner.helpers.js';
import type { AuthenticatedRequest } from '../modules/auth/auth.types.js';
import { extractTesterEmail } from '../modules/auth/auth.helpers.js';

const geminiService = new GeminiAIService();

// Helper para obtener el prompt_id asociado a la suite desde MySQL
async function getPromptIdFromSuite(suiteId: string): Promise<string> {
  try {
    const [rows] = await getDbPool().execute<any[]>(
      'SELECT prompt_id FROM test_suites WHERE id = ?',
      [suiteId]
    );
    if (rows && rows.length > 0 && rows[0].prompt_id) {
      return rows[0].prompt_id;
    }
  } catch (err) {
    console.warn(`[!] No se pudo obtener prompt_id para suiteId ${suiteId}:`, (err as Error).message);
  }
  return '';
}

async function processInputAudit(
  runId: string,
  targetUrl: string,
  inputs: TargetSelector[],
  promptId: string
): Promise<ReturnType<typeof getFindingsByRunId>> {
  const auditResults = await executeInputAuditRunner(targetUrl, inputs, promptId);

  for (const resItem of auditResults) {
    const rawFinding = buildFindingFromAudit(runId, targetUrl, resItem);
    
    const findingData = {
      ...rawFinding,
      module_name: 'INPUT_INJECTION_AUDIT',
    };

    await saveFinding(findingData as any);
  }
  return await getFindingsByRunId(runId);
}

export const executeTestRun = async (
  req: Request<{}, {}, RunTestDTO & { targetInputs?: TargetSelector[]; promptId?: string }>,
  res: Response
): Promise<void> => {
  try {
    const { suiteId, targetUrl, targetInputs, promptId: bodyPromptId } = req.body;
    const runId = generateUniqueId();

    // 1. Obtener email del usuario autenticado o 'visitante'
    const testerEmail = extractTesterEmail(req as AuthenticatedRequest);

    // 2. Registrar ejecución asociando al tester responsable
    await getDbPool().execute(
      'INSERT INTO test_runs (id, test_suite_id, tester_email, status) VALUES (?, ?, ?, ?)',
      [runId, suiteId, testerEmail, 'RUNNING']
    );

    const hasInputs = targetInputs && Array.isArray(targetInputs) && targetInputs.length > 0;

    let allFindings;
    if (hasInputs) {
      const dbPromptId = await getPromptIdFromSuite(suiteId);
      const activePromptId = bodyPromptId || dbPromptId;
      allFindings = await processInputAudit(runId, targetUrl, targetInputs!, activePromptId);
    } else {
      const sessionData = await runAnalysisSession(targetUrl, true);
      allFindings = await executeModulesAndSaveFindings(
        runId,
        targetUrl,
        sessionData.requests,
        sessionData.responses
      );
    }

    await getDbPool().execute(
      'UPDATE test_runs SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['COMPLETED', runId]
    );

    res.status(200).json({
      success: true,
      runId,
      totalFindings: allFindings.length,
      findings: allFindings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getRunReport = async (req: Request<{ runId: string }>, res: Response): Promise<void> => {
  try {
    const { runId } = req.params;
    const rawFindings = await getFindingsByRunId(runId);
    const enrichedFindings = await geminiService.enrichFindingsWithAiRecommendations(rawFindings);
    const summaryInputs = mapFindingsToSummaryInput(enrichedFindings);
    const aiSummary =
      enrichedFindings.length > 0 ? await geminiService.generateExecutiveSummary(summaryInputs) : null;

    res.status(200).json({
      success: true,
      runId,
      findingsCount: enrichedFindings.length,
      findings: enrichedFindings,
      aiSummary,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};