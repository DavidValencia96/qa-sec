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
import { analyzeSastContentHandler } from '../controllers/sast.controller.js';
import { exportReportHandler } from '../controllers/reportExport.controller.js';
import {
  getSastHistoryHandler,
  getSastHistoryItemHandler,
} from '../controllers/sast/sastHistory.controller.js';
import { runLoadTestHandler } from '../controllers/loadTest/loadTest.controller.js';
import { getLoadTestHistoryHandler } from '../controllers/loadTest/loadTestHistory.controller.js';
import { exportConsolidatedReportHandler } from '../controllers/report/consolidatedReport.controller.js';
import { exportSingleRecordHandler } from '../controllers/report/singleReportExport.controller.js';
import { runDastAuditHandler } from '../controllers/dast/dast.controller.js';
import { runScaAuditHandler } from '../controllers/sca/sca.controller.js';
import { runEasmAuditHandler } from '../controllers/easm/easm.controller.js';
import { runRedTeamAuditHandler } from '../controllers/redteam/redteam.controller.js';
import emailSecRoutes from './emailsec.routes.js';

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
router.post('/sast/analyze', analyzeSastContentHandler);
router.post('/reports/export', exportReportHandler);

// Registrar rutas de historial SAST:
router.get('/sast/history', getSastHistoryHandler);
router.get('/sast/history/:id', getSastHistoryItemHandler);

router.post('/load-test/run', runLoadTestHandler);
router.get('/load-test/history', getLoadTestHistoryHandler);

router.post('/reports/consolidated/export', exportConsolidatedReportHandler);
router.post('/reports/single/export', exportSingleRecordHandler);

router.post('/dast/run', runDastAuditHandler);
router.post('/sca/run', runScaAuditHandler);

router.post('/easm/audit', runEasmAuditHandler);
router.post('/redteam/audit', runRedTeamAuditHandler);

router.use('/emailsec', emailSecRoutes);

export const apiRouter = router;
export default router;