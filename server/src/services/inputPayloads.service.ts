import { getDbPool } from '../config/database.js';

export interface InputPromptRow {
  id: string;
  name: string;
  prompt_text: string;
}

export interface InputPayloadRow {
  id: string;
  prompt_id: string;
  payload_value: string;
  description: string;
}

export async function getAllPrompts(): Promise<InputPromptRow[]> {
  const [rows] = await getDbPool().execute('SELECT * FROM input_prompts ORDER BY created_at DESC');
  return rows as InputPromptRow[];
}

export async function getPayloadsByPromptId(promptId: string): Promise<InputPayloadRow[]> {
  const [rows] = await getDbPool().execute('SELECT * FROM input_payloads WHERE prompt_id = ?', [promptId]);
  return rows as InputPayloadRow[];
}