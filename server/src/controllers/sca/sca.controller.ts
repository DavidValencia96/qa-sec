import type { Request, Response } from 'express';
import { getDbPool } from '../../config/database.js';
import { generateId } from '../../utils/id.generator.js';
import { ScaDependencyScannerService } from '../../services/sca/scaDependencyScanner.service.js';
import { GitHistoryScannerService } from '../../services/sca/gitHistoryScanner.service.js';
import type { ScaAuditConfigDTO } from '../../modules/sca/sca.types.js';
import type { AuthenticatedRequest } from '../../modules/auth/auth.types.js';
import { extractTesterEmail } from '../../modules/auth/auth.helpers.js';

const dependencyScanner = new ScaDependencyScannerService();
const gitScanner = new GitHistoryScannerService();

export const runScaAuditHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = req.body as ScaAuditConfigDTO;
    const runId = generateId('sca');

    // 1. Identificar al ejecutor de la prueba
    const testerEmail = extractTesterEmail(req as AuthenticatedRequest);

    const vulnerabilities = config.enableDependencyScan && config.manifestContent && config.manifestType
      ? await dependencyScanner.scanManifest(config.manifestContent, config.manifestType)
      : [];

    const gitSecrets = config.enableGitHistoryScan && config.manifestContent
      ? gitScanner.scanContentForSecrets(config.manifestContent)
      : [];

    const totalAudited = config.manifestContent ? config.manifestContent.split('\n').length : 0;

    const aiSummary = {
      summary: `Escaneo SCA completado. Se detectaron ${vulnerabilities.length} vulnerabilidades en dependencias y ${gitSecrets.length} secretos expuestos.`,
      riskLevel: (gitSecrets.length > 0 || vulnerabilities.some(v => v.severity === 'CRITICAL')) ? 'CRITICAL' as const : 'MEDIUM' as const,
      recommendations: [
        'Actualizar las dependencias señaladas a versiones parcheadas sin vulnerabilidades asociadas.',
        'Rotar inmediatamente cualquier token o API Key detectado en el código fuente o historial de Git.',
      ],
    };

    // 2. Persistencia en MySQL con tester_email
    const query = `
      INSERT INTO sca_history (id, tester_email, manifest_type, total_deps_audited, vulnerabilities_json, git_secrets_json, ai_summary_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await getDbPool().execute(query, [
      runId,
      testerEmail,
      config.manifestType || 'package_json',
      totalAudited,
      JSON.stringify(vulnerabilities),
      JSON.stringify(gitSecrets),
      JSON.stringify(aiSummary),
    ]);

    res.status(200).json({
      success: true,
      runId,
      totalDependenciesAudited: totalAudited,
      vulnerabilities,
      gitSecrets,
      aiSummary,
    });
  } catch (error) {
    console.error('[!] Error en runScaAuditHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};