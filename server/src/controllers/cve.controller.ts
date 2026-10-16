import type { Request, Response } from 'express';
import { CveService } from '../services/cve.service.js';
import { GeminiAIService } from '../services/gemini.service.js';
import { getCachedCveAnalysis, saveCveAnalysisCache } from './cve/cve.helpers.js';

const cveService = new CveService();
const geminiService = new GeminiAIService();

export const getLatestThreats = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = req.query.keyword as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 40;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const feed = await cveService.fetchLatestVulnerabilities({ keyword, limit, startDate, endDate });
    res.status(200).json(feed);
  } catch (error) {
    console.error('[!] Error en getLatestThreats:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const analyzeCveWithAiHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cveId, severity, cvssScore, description, targetStack } = req.body;

    if (!cveId || !description) {
      res.status(400).json({ success: false, error: 'Se requieren los campos cveId y description.' });
      return;
    }

    const cachedResult = await getCachedCveAnalysis(cveId);
    if (cachedResult) {
      res.status(200).json({ success: true, cveId, analysis: cachedResult, fromCache: true });
      return;
    }

    const analysis = await geminiService.analyzeCveWithAi({
      cveId,
      severity: severity || 'MEDIUM',
      cvssScore: cvssScore || 0,
      description,
      targetStack,
    });

    await saveCveAnalysisCache(cveId, analysis);

    res.status(200).json({ success: true, cveId, analysis, fromCache: false });
  } catch (error) {
    console.error('[!] Error en analyzeCveWithAiHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};