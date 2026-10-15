import { Router } from 'express';
import {
  createProject,
  generateSuiteWithAI,
  executeTestRun,
  getRunReport,
  handleAnalyzeNetworkConfig,
  getTestRunsHistory,
  getPromptPresets,
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

router.get('/prompts/presets', getPromptPresets);


export const apiRouter = router;
export default router;