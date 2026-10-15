const BASE_URL = 'http://localhost:3000/api';

export const createProjectApi = async (name: string, targetUrl: string, description?: string) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, targetUrl, description }),
  });
  return res.json();
};

export const generateSuiteAIApi = async (projectId: string, userPrompt: string) => {
  const res = await fetch(`${BASE_URL}/suites/generate-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, userPrompt }),
  });
  return res.json();
};

export const runTestApi = async (suiteId: string, targetUrl: string) => {
  const res = await fetch(`${BASE_URL}/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suiteId, targetUrl }),
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
  return await response.json();
};