import { Request, Response } from 'express';
import { generateUniqueId } from '../utils/id.generator.js';
import { GeminiAIService } from '../services/gemini.service.js';
import { CreateProjectDTO } from './api.types.js';
import { insertProjectRecord, insertTestSuiteRecord } from './project/project.helpers.js';

const geminiService = new GeminiAIService();

export const createProject = async (req: Request<{}, {}, CreateProjectDTO>, res: Response): Promise<void> => {
  try {
    const { name, targetUrl, description } = req.body;
    const projectId = generateUniqueId();
    await insertProjectRecord(projectId, name, targetUrl, description);
    res.status(201).json({ success: true, projectId, message: 'Proyecto creado exitosamente.' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const generateSuiteWithAI = async (
  req: Request<{}, {}, { projectId: string; userPrompt: string; promptId?: string }>,
  res: Response
): Promise<void> => {
  try {
    const { projectId, userPrompt, promptId } = req.body;
    console.log('[+] Generando suite con Gemini AI para el proyecto:', projectId, '| Prompt ID:', promptId || 'N/A');
    const suiteConfig = await geminiService.generateSuiteFromPrompt(userPrompt);
    const suiteId = generateUniqueId();
    await insertTestSuiteRecord(suiteId, projectId, userPrompt, suiteConfig, promptId);
    res.status(201).json({ success: true, suiteId, config: suiteConfig });
  } catch (error) {
    console.error('[!] Error en generateSuiteWithAI:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};