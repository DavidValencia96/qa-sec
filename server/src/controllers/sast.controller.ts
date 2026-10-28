import type { Request, Response } from 'express';
import { SecretScannerService } from '../services/sast/secretScanner.service.js';
import { DependencyScannerService } from '../services/sast/dependencyScanner.service.js';
import { GeminiAIService } from '../services/gemini.service.js';
import type { SastAnalysisRequestDTO, SastFinding } from '../modules/sast/sast.types.js';
import { generateId } from '../utils/id.generator.js';
import { saveSastAuditRecord } from './sast/sast.helpers.js';
import type { AuthenticatedRequest } from '../modules/auth/auth.types.js';
import { extractTesterEmail } from '../modules/auth/auth.helpers.js';

const secretScanner = new SecretScannerService();
const dependencyScanner = new DependencyScannerService();
const geminiService = new GeminiAIService();

export const analyzeSastContentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { codeOrContent, fileName = 'snippet.txt', fileType = 'code', language } = req.body as SastAnalysisRequestDTO;

    if (!codeOrContent || codeOrContent.trim().length === 0) {
      res.status(400).json({ success: false, error: 'El contenido para auditar no puede estar vacío.' });
      return;
    }

    // 1. Extraer identificador del tester
    const testerEmail = extractTesterEmail(req as AuthenticatedRequest);

    let findings: SastFinding[] = [];

    // 2. Escaneo Regex de Secretos
    const secretFindings = secretScanner.scanContentForSecrets(codeOrContent);
    findings = [...findings, ...secretFindings];

    // 3. Escaneo de Dependencias si es package.json
    if (fileType === 'package_json' || fileName.endsWith('package.json')) {
      const depFindings = dependencyScanner.scanPackageJson(codeOrContent);
      findings = [...findings, ...depFindings];
    }

    // 4. Auditoría SAST con IA (Gemini)
    const aiResult = await geminiService.analyzeCodeWithAi({
      codeOrContent,
      language,
      fileType,
    });

    findings = [...findings, ...aiResult.findings];

    // Calcular score deduciendo puntos según severidad
    let computedScore = Math.min(100, aiResult.score);
    findings.forEach((f) => {
      if (f.severity === 'CRITICAL') computedScore -= 25;
      else if (f.severity === 'HIGH') computedScore -= 15;
      else if (f.severity === 'MEDIUM') computedScore -= 5;
    });
    computedScore = Math.max(0, computedScore);

    const auditId = generateId('sast_audit');
    const responseData = {
      success: true,
      score: computedScore,
      totalFindings: findings.length,
      findings,
      remediatedCode: aiResult.remediatedCode,
      analyzedAt: new Date().toISOString(),
    };

    // 5. Guardar asociando al ejecutor
    await saveSastAuditRecord(auditId, fileName, fileType, responseData, testerEmail);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('[!] Error en analyzeSastContentHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};