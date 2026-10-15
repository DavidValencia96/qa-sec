import { Request, Response } from 'express';
import { getDbPool } from '../config/database.js';
import { runAnalysisSession } from '../core/runner.js';
import { getFindingsByRunId } from '../services/findings.service.js';
import { GeminiAIService } from '../services/gemini.service.js';
import { generateUniqueId } from '../utils/id.generator.js';
import { RunTestDTO } from './api.types.js';
import { executeModulesAndSaveFindings, mapFindingsToSummaryInput } from './scanner/scanner.helpers.js';

const geminiService = new GeminiAIService();

export const executeTestRun = async (req: Request<{}, {}, RunTestDTO>, res: Response): Promise<void> => {
  try {
    const { suiteId, targetUrl } = req.body;
    const runId = generateUniqueId();

    await getDbPool().execute('INSERT INTO test_runs (id, test_suite_id, status) VALUES (?, ?, ?)', [runId, suiteId, 'RUNNING']);

    const sessionData = await runAnalysisSession(targetUrl, true);
    const allFindings = await executeModulesAndSaveFindings(runId, targetUrl, sessionData.requests, sessionData.responses);

    await getDbPool().execute('UPDATE test_runs SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?', ['COMPLETED', runId]);

    res.status(200).json({ success: true, runId, totalFindings: allFindings.length, findings: allFindings });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getRunReport = async (req: Request<{ runId: string }>, res: Response): Promise<void> => {
  try {
    const { runId } = req.params;
    const rawFindings = await getFindingsByRunId(runId);

    // 1. Enriquecer las recomendaciones con Gemini AI
    const enrichedFindings = await geminiService.enrichFindingsWithAiRecommendations(rawFindings);

    // 2. Generar el resumen ejecutivo con los hallazgos enriquecidos
    const summaryInputs = mapFindingsToSummaryInput(enrichedFindings);
    const aiSummary = enrichedFindings.length > 0 ? await geminiService.generateExecutiveSummary(summaryInputs) : null;

    res.status(200).json({ 
      success: true, 
      runId, 
      findingsCount: enrichedFindings.length, 
      findings: enrichedFindings, 
      aiSummary 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};