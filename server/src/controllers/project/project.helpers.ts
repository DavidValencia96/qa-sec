import { getDbPool } from '../../config/database.js';
import { GeneratedSuiteConfig } from '../../services/gemini.types.js';

export const insertProjectRecord = async (
  projectId: string,
  name: string,
  targetUrl: string,
  description?: string
): Promise<void> => {
  const query = 'INSERT INTO projects (id, name, target_url, description) VALUES (?, ?, ?, ?)';
  await getDbPool().execute(query, [projectId, name, targetUrl, description || null]);
};

export const insertTestSuiteRecord = async (
  suiteId: string,
  projectId: string,
  userPrompt: string,
  suiteConfig: GeneratedSuiteConfig
): Promise<void> => {
  const query = 'INSERT INTO test_suites (id, project_id, name, prompt_input, modules_config) VALUES (?, ?, ?, ?, ?)';
  await getDbPool().execute(query, [
    suiteId,
    projectId,
    suiteConfig.suiteName,
    userPrompt || null,
    JSON.stringify(suiteConfig),
  ]);
};

export interface PromptPreset {
  id: number;
  title: string;
  promptText: string;
  category: string;
}

export const fetchPromptPresets = async (): Promise<PromptPreset[]> => {
  const [rows] = await getDbPool().query(
    'SELECT id, title, prompt_text AS promptText, category FROM prompt_presets ORDER BY id ASC'
  );
  return rows as PromptPreset[];
};