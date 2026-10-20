import type { Request, Response } from 'express';
import { ComplianceEvaluatorService } from '../../services/compliance/complianceEvaluator.service.js';
import { GeminiAIService } from '../../services/gemini.service.js';

const complianceEvaluator = new ComplianceEvaluatorService();
const geminiService = new GeminiAIService();

export const getComplianceRadarHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetFilter = req.query.target as string | undefined;

    const evalResult = await complianceEvaluator.evaluateGlobalCompliance(targetFilter);
    const aiSummary = await geminiService.analyzeComplianceStatusWithAi(
      evalResult.overallComplianceScore,
      evalResult.standards
    );

    res.status(200).json({
      success: true,
      ...evalResult,
      aiExecutiveSummary: aiSummary,
    });
  } catch (error) {
    console.error('[!] Error en getComplianceRadarHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getComplianceTargetsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const targets = await complianceEvaluator.getAvailableTargets();
    res.status(200).json({ success: true, targets });
  } catch (error) {
    console.error('[!] Error en getComplianceTargetsHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};