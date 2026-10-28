import type { Request, Response } from 'express';
import { LoadTestRunnerService } from '../../services/loadTest/loadTestRunner.service.js';
import { generateId } from '../../utils/id.generator.js';
import { saveLoadTestAuditRecord } from './loadTest.helpers.js';
import { GeminiAIService } from '../../services/gemini.service.js';
import type { LoadTestConfigDTO } from '../../modules/loadTest/loadTest.types.js';
import type { AuthenticatedRequest } from '../../modules/auth/auth.types.js';
import { extractTesterEmail } from '../../modules/auth/auth.helpers.js';

const runnerService = new LoadTestRunnerService();
const geminiService = new GeminiAIService();

export const runLoadTestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = req.body as LoadTestConfigDTO;

    if (!config.targetUrl) {
      res.status(400).json({ success: false, error: 'La URL objetivo (targetUrl) es requerida.' });
      return;
    }

    // Identificar al ejecutor
    const testerEmail = extractTesterEmail(req as AuthenticatedRequest);

    // Configuración por defecto y límites de seguridad
    const safeConfig: LoadTestConfigDTO = {
      targetUrl: config.targetUrl,
      method: config.method || 'GET',
      concurrency: Math.min(Math.max(config.concurrency || 10, 1), 100),
      durationSeconds: Math.min(Math.max(config.durationSeconds || 5, 2), 30),
      headers: config.headers,
      headersJson: config.headersJson,
      payloadJson: config.payloadJson,
    };

    const runId = generateId('loadtest');

    // 1. Ejecutar prueba de carga controlada
    const metrics = await runnerService.executeLoadTest(safeConfig);

    // 2. Diagnóstico IA con Gemini AI
    const aiDiagnosis = await geminiService.analyzeLoadTestWithAi(safeConfig, metrics);

    // 3. Guardar persistencia en MySQL asociando al tester responsable
    await saveLoadTestAuditRecord(runId, safeConfig, metrics, JSON.stringify(aiDiagnosis), testerEmail);

    res.status(200).json({
      success: true,
      runId,
      config: safeConfig,
      metrics,
      aiDiagnosis,
    });
  } catch (error) {
    console.error('[!] Error en runLoadTestHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};