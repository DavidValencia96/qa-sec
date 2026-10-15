import { Request, Response } from 'express';
import { fetchPromptPresets } from './project/project.helpers.js';
import { getDbPool } from '../config/database.js';

export const getPromptPresets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const presets = await fetchPromptPresets();
    res.status(200).json({ success: true, presets });
  } catch (error) {
    console.error('[!] Error en getPromptPresets:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getInputPrompts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await getDbPool().query(
      'SELECT id, name, priority, prompt_text FROM input_prompts ORDER BY priority ASC'
    );
    res.status(200).json({ success: true, prompts: rows });
  } catch (error) {
    console.error('[!] Error en getInputPrompts:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getPromptsHandler = getInputPrompts;