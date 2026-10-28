import type { Request, Response } from 'express';
import { JwtScannerService } from '../../services/redteam/jwtScanner.service.js';
import { CorsScannerService } from '../../services/redteam/corsScanner.service.js';
import { PhishingSimulatorService } from '../../services/redteam/phishingSimulator.service.js';
import { GeminiAIService } from '../../services/gemini.service.js';
import { getDbPool } from '../../config/database.js';
import { generateUniqueId } from '../../utils/id.generator.js';
import type { RedTeamAuditPayload, RedTeamAuditResponse, JwtFinding, CorsFinding } from '../../modules/redteam/redteam.types.js';
import type { AuthenticatedRequest } from '../../modules/auth/auth.types.js';
import { extractTesterEmail } from '../../modules/auth/auth.helpers.js';

const jwtScanner = new JwtScannerService();
const corsScanner = new CorsScannerService();
const phishingSimulator = new PhishingSimulatorService();
const geminiService = new GeminiAIService();

export const runRedTeamAuditHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as RedTeamAuditPayload;

    if (!payload.targetUrl) {
      res.status(400).json({ success: false, error: 'La URL objetivo (targetUrl) es requerida.' });
      return;
    }

    // 1. Extraer identificador del tester (email autenticado o 'visitante')
    const testerEmail = extractTesterEmail(req as AuthenticatedRequest);

    const runId = generateUniqueId();
    let jwtFindings: JwtFinding[] = [];
    let corsFindings: CorsFinding[] = [];
    let phishingCount = 0;

    if (payload.enableJwtScanner && payload.jwtToken) {
      jwtFindings = await jwtScanner.scanToken(payload.targetUrl, payload.jwtToken, payload.publicKeyPem);
    }

    if (payload.enableCorsExploiter) {
      corsFindings = await corsScanner.scanCors(payload.targetUrl);
    }

    if (payload.enablePhishingSimulator && payload.phishingTargetEmails) {
      const phishResult = phishingSimulator.simulateCampaign(payload.phishingTargetEmails);
      phishingCount = phishResult.simulatedCount;
    }

    const aiSummary = await geminiService.analyzeRedTeamFindings(
      payload.targetUrl,
      jwtFindings,
      corsFindings,
      phishingCount
    );

    // 2. Persistir auditoría en MySQL asociando al tester responsable
    const pool = getDbPool();
    await pool.query(
      `INSERT INTO redteam_history (id, tester_email, target_url, jwt_token, jwt_findings_json, cors_findings_json, phishing_count, ai_summary_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        runId,
        testerEmail,
        payload.targetUrl,
        payload.jwtToken || null,
        JSON.stringify(jwtFindings),
        JSON.stringify(corsFindings),
        phishingCount,
        JSON.stringify(aiSummary),
      ]
    );

    const response: RedTeamAuditResponse = {
      success: true,
      runId,
      jwtFindings,
      corsFindings,
      phishingSimulatedCount: phishingCount,
      aiSummary,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('[!] Error en runRedTeamAuditHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};