import { Request, Response } from 'express';
import { generateUniqueId } from '../utils/id.generator.js';
import { GeminiAIService } from '../services/gemini.service.js';
import { CreateProjectDTO, GenerateSuitePromptDTO } from './api.types.js';
import { insertProjectRecord, insertTestSuiteRecord, fetchPromptPresets } from './project/project.helpers.js';

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

export const generateSuiteWithAI = async (req: Request<{}, {}, GenerateSuitePromptDTO>, res: Response): Promise<void> => {
  try {
    const { projectId, userPrompt } = req.body;
    console.log('[+] Generando suite con Gemini AI para el proyecto:', projectId);

    const suiteConfig = await geminiService.generateSuiteFromPrompt(userPrompt);
    const suiteId = generateUniqueId();

    await insertTestSuiteRecord(suiteId, projectId, userPrompt, suiteConfig);

    res.status(201).json({ success: true, suiteId, config: suiteConfig });
  } catch (error) {
    console.error('[!] Error en generateSuiteWithAI:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getPromptPresets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const presets = await fetchPromptPresets();
    res.status(200).json({ success: true, presets });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};