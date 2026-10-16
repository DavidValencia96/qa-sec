import { Router } from 'express';
import {
  createProject,
  generateSuiteWithAI,
  executeTestRun,
  getRunReport,
  handleAnalyzeNetworkConfig,
  getTestRunsHistory,
  getPromptPresets,
  getInputPrompts,
  getLatestThreats,
  analyzeCveWithAiHandler,
} from '../controllers/index.js';

const router = Router();

// Proyectos y Suites
router.post('/projects', createProject);
router.post('/suites/generate-ai', generateSuiteWithAI);

// Pruebas y Reportes Web
router.post('/tests/run', executeTestRun);
router.get('/reports/:runId', getRunReport);

// Auditoría de Red
router.post('/network/analyze-config', handleAnalyzeNetworkConfig);

// Historial
router.get('/history', getTestRunsHistory);

// Prompts y Presets
router.get('/prompts/presets', getPromptPresets);
router.get('/prompts', getInputPrompts);

// CiberThreat Feed & CVE Radar
router.get('/threats/latest', getLatestThreats);
router.post('/threats/analyze-cve', analyzeCveWithAiHandler);

export const apiRouter = router;
export default router;