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
import complianceRoutes from './compliance.routes.js';
import { handleHeartbeat } from '../controllers/telemetry.controller.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

// 1. Módulos de Autenticación y Administración RBAC
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// 2. Telemetría y Configuración Pública
router.post('/telemetry/heartbeat', handleHeartbeat);
router.get('/prompts/presets', getPromptPresets);
router.get('/prompts', getInputPrompts);
router.get('/threats/latest', getLatestThreats);

// 3. Módulos Públicos: Escáner Web General e Inputs & Sanitización
router.post('/projects', createProject);
router.post('/suites/generate-ai', generateSuiteWithAI);
router.post('/tests/run', executeTestRun);
router.get('/reports/:runId', getRunReport);

// 4. Auditorías Avanzadas y Motores Profundos (Requieren sesión: ADMIN o AUDITOR)
router.post('/network/analyze-config', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), handleAnalyzeNetworkConfig);
router.post('/threats/analyze-cve', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), analyzeCveWithAiHandler);
router.post('/sast/analyze', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), analyzeSastContentHandler);
router.post('/load-test/run', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), runLoadTestHandler);
router.post('/dast/run', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), runDastAuditHandler);
router.post('/sca/run', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), runScaAuditHandler);
router.post('/easm/audit', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), runEasmAuditHandler);
router.post('/redteam/audit', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), runRedTeamAuditHandler);
router.use('/emailsec', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), emailSecRoutes);
router.use('/compliance', authenticateJwt, requireRole(['ADMIN', 'AUDITOR']), complianceRoutes);

// 5. Historial Centralizado y Exportación (Requieren sesión: ADMIN, AUDITOR o VIEWER)
router.get('/history', authenticateJwt, requireRole(['ADMIN', 'AUDITOR', 'VIEWER']), getTestRunsHistory);
router.get('/sast/history', authenticateJwt, requireRole(['ADMIN', 'AUDITOR', 'VIEWER']), getSastHistoryHandler);
router.get('/sast/history/:id', authenticateJwt, requireRole(['ADMIN', 'AUDITOR', 'VIEWER']), getSastHistoryItemHandler);
router.get('/load-test/history', authenticateJwt, requireRole(['ADMIN', 'AUDITOR', 'VIEWER']), getLoadTestHistoryHandler);
router.post('/reports/export', authenticateJwt, requireRole(['ADMIN', 'AUDITOR', 'VIEWER']), exportReportHandler);
router.post('/reports/consolidated/export', authenticateJwt, requireRole(['ADMIN', 'AUDITOR', 'VIEWER']), exportConsolidatedReportHandler);
router.post('/reports/single/export', authenticateJwt, requireRole(['ADMIN', 'AUDITOR', 'VIEWER']), exportSingleRecordHandler);

export const apiRouter = router;
export default router;