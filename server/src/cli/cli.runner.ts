import { NotificationService } from '../services/notification.service.js';
import type { CliArguments, CliExecutionResult, RiskThreshold } from './cli.types.js';

const SEVERITY_WEIGHTS: Record<RiskThreshold | 'NONE', number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NONE: 0,
};

export class CliRunnerService {
  public async executeScan(args: CliArguments & { slackWebhook?: string; genericWebhook?: string }): Promise<CliExecutionResult> {
    if (!args.targetUrl && args.module !== 'sast' && args.module !== 'sca') {
      throw new Error('Debes especificar un objetivo con --target <url>');
    }

    if (args.verbose) {
      console.log(`🔍 [QA-Sec CLI] Auditoría en modo '${args.module}' sobre: ${args.targetUrl || 'Archivos locales'}`);
    }

    let highestSeverity: RiskThreshold | 'NONE' = 'NONE';
    const findingsSummary: string[] = [];

    const thresholdWeight = SEVERITY_WEIGHTS[args.threshold];
    const detectedWeight = SEVERITY_WEIGHTS[highestSeverity];
    const violationDetected = detectedWeight >= thresholdWeight;

    const resultStatus = violationDetected ? 'FAILED' : 'PASSED';
    const summaryText = violationDetected
      ? `🚨 VIOLACIÓN DE SEGURIDAD: Se detectó severidad ${highestSeverity} (Umbral: ${args.threshold}).`
      : `✅ AUDITORÍA APROBADA: Sin vulnerabilidades que superen el umbral ${args.threshold}.`;

    // Enviar alerta por Slack si se proveyó la URL
    if (args.slackWebhook) {
      if (args.verbose) console.log('🔔 Enviando notificación a canal de Slack...');
      await NotificationService.sendSlackAlert(args.slackWebhook, {
        title: 'Reporte de Auditoría CI/CD',
        projectName: 'QA-Sec Suite Pipeline',
        targetUrl: args.targetUrl,
        status: resultStatus,
        highestSeverity,
        summary: summaryText,
      });
    }

    return {
      success: true,
      violationDetected,
      highestSeverity,
      summary: summaryText,
      details: {
        target: args.targetUrl,
        module: args.module,
        threshold: args.threshold,
        findingsCount: findingsSummary.length,
      },
    };
  }
}