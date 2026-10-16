import type { TargetInput } from '../components/dashboard/dashboard.types';

const BASE_URL = 'http://localhost:3000/api';

export const createProjectApi = async (name: string, targetUrl: string, description?: string) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, targetUrl, description }),
  });
  return res.json();
};

export const generateSuiteAIApi = async (projectId: string, userPrompt: string, promptId?: string) => {
  const res = await fetch(`${BASE_URL}/suites/generate-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, userPrompt, promptId }),
  });
  return res.json();
};

export const runTestApi = async (
  suiteId: string,
  targetUrl: string,
  targetInputs?: TargetInput[],
  promptId?: string
) => {
  const res = await fetch(`${BASE_URL}/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suiteId, targetUrl, targetInputs, promptId }),
  });
  return res.json();
};

export const getReportApi = async (runId: string) => {
  const res = await fetch(`${BASE_URL}/reports/${runId}`);
  return res.json();
};

export const getHistoryApi = async () => {
  const response = await fetch(`${BASE_URL}/history`);
  return await response.json();
};

export const analyzeNetworkConfigApi = async (targetHost: string) => {
  const response = await fetch(`${BASE_URL}/network/analyze-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetHost }),
  });
  return await response.json();
};

export const getPromptPresetsApi = async () => {
  const response = await fetch(`${BASE_URL}/prompts/presets`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: No se pudieron obtener las plantillas generales.`);
  }
  return await response.json();
};

export async function getPromptsApi() {
  const response = await fetch(`${BASE_URL}/prompts`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: No se pudo obtener la lista de prompts de inputs.`);
  }
  return await response.json();
}

export const getLatestThreatsApi = async (
  keyword?: string,
  limit: number = 40,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (keyword) params.append('keyword', keyword);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const res = await fetch(`${BASE_URL}/threats/latest?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Error obteniendo vulnerabilidades.`);
  return res.json();
};

export const analyzeCveWithAiApi = async (cveData: {
  cveId: string;
  severity: string;
  cvssScore: number;
  description: string;
  targetStack?: string;
}) => {
  const res = await fetch(`${BASE_URL}/threats/analyze-cve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cveData),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Error al analizar CVE con IA.`);
  return res.json();
};

export const analyzeSastContentApi = async (payload: {
  codeOrContent: string;
  fileName?: string;
  fileType?: 'code' | 'env' | 'package_json';
  language?: string;
}) => {
  const res = await fetch(`${BASE_URL}/sast/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Error al realizar el análisis estático.`);
  }

  return res.json();
};