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
import { authenticateJwt, optionalJwt } from '../middleware/auth.middleware.js';
import { requireModuleAccess, requireRole, auditAction } from '../middleware/rbac.middleware.js';
import { guestScanLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// 1. Módulos de Autenticación y Administración RBAC
router.use('/auth', authRoutes);
router.use('/admin', authenticateJwt, requireRole(['ADMIN']), adminRoutes);

// 2. Telemetría y Configuración Pública
router.post('/telemetry/heartbeat', handleHeartbeat);
router.get('/prompts/presets', getPromptPresets);
router.get('/prompts', getInputPrompts);
router.get('/threats/latest', getLatestThreats);

// 3. Módulos Públicos: Escáner Web General e Inputs (Protegidos con Rate Limit defensivo)
router.post('/projects', optionalJwt, createProject);
router.post('/suites/generate-ai', optionalJwt, generateSuiteWithAI);
router.post(
  '/tests/run',
  optionalJwt,
  guestScanLimiter,
  auditAction('EXECUTE_SCAN', 'SCANNER'),
  executeTestRun
);
router.get('/reports/:runId', optionalJwt, getRunReport);

// 4. Auditorías Especializadas (Autenticación JWT obligatoria + Validación de Módulo + Auditoría)
router.post(
  '/network/analyze-config',
  authenticateJwt,
  requireModuleAccess('NETWORK'),
  auditAction('NETWORK_ANALYSIS', 'NETWORK'),
  handleAnalyzeNetworkConfig
);

router.post(
  '/threats/analyze-cve',
  authenticateJwt,
  requireModuleAccess('CVE'),
  auditAction('CVE_AI_ANALYSIS', 'CVE'),
  analyzeCveWithAiHandler
);

router.post(
  '/sast/analyze',
  authenticateJwt,
  requireModuleAccess('SAST'),
  auditAction('SAST_AUDIT', 'SAST'),
  analyzeSastContentHandler
);

router.post(
  '/load-test/run',
  authenticateJwt,
  requireModuleAccess('LOADTEST'),
  auditAction('LOAD_TEST_RUN', 'LOADTEST'),
  runLoadTestHandler
);

router.post(
  '/dast/run',
  authenticateJwt,
  requireModuleAccess('DAST'),
  auditAction('DAST_AUDIT', 'DAST'),
  runDastAuditHandler
);

router.post(
  '/sca/run',
  authenticateJwt,
  requireModuleAccess('SCA'),
  auditAction('SCA_AUDIT', 'SCA'),
  runScaAuditHandler
);

router.post(
  '/easm/audit',
  authenticateJwt,
  requireModuleAccess('EASM'),
  auditAction('EASM_AUDIT', 'EASM'),
  runEasmAuditHandler
);

router.post(
  '/redteam/audit',
  authenticateJwt,
  requireModuleAccess('REDTEAM'),
  auditAction('REDTEAM_AUDIT', 'REDTEAM'),
  runRedTeamAuditHandler
);

router.use(
  '/emailsec',
  authenticateJwt,
  requireModuleAccess('EMAILSEC'),
  auditAction('EMAILSEC_AUDIT', 'EMAILSEC'),
  emailSecRoutes
);

router.use(
  '/compliance',
  authenticateJwt,
  requireModuleAccess('COMPLIANCE'),
  auditAction('COMPLIANCE_AUDIT', 'COMPLIANCE'),
  complianceRoutes
);

// 5. Historial Centralizado y Reportes (Protegidos por módulo y rol)
router.get('/history', optionalJwt, getTestRunsHistory);

router.get(
  '/sast/history',
  authenticateJwt,
  requireModuleAccess('SAST'),
  getSastHistoryHandler
);

router.get(
  '/sast/history/:id',
  authenticateJwt,
  requireModuleAccess('SAST'),
  getSastHistoryItemHandler
);

router.get(
  '/load-test/history',
  authenticateJwt,
  requireModuleAccess('LOADTEST'),
  getLoadTestHistoryHandler
);

router.post(
  '/reports/export',
  authenticateJwt,
  requireModuleAccess('REPORTS'),
  auditAction('EXPORT_REPORT', 'REPORTS'),
  exportReportHandler
);

router.post(
  '/reports/consolidated/export',
  authenticateJwt,
  requireModuleAccess('REPORTS'),
  auditAction('EXPORT_CONSOLIDATED_REPORT', 'REPORTS'),
  exportConsolidatedReportHandler
);

router.post(
  '/reports/single/export',
  authenticateJwt,
  requireModuleAccess('REPORTS'),
  auditAction('EXPORT_SINGLE_REPORT', 'REPORTS'),
  exportSingleRecordHandler
);

export const apiRouter = router;
export default router;