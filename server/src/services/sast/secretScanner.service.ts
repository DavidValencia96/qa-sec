import { SECRET_RULES } from '../../modules/sast/sast.constants.js';
import type { SastFinding } from '../../modules/sast/sast.types.js';
import { generateId } from '../../utils/id.generator.js';

export class SecretScannerService {
  public scanContentForSecrets(content: string): SastFinding[] {
    const lines = content.split('\n');
    const findings: SastFinding[] = [];

    lines.forEach((lineText, index) => {
      this.evaluateLineAgainstRules(lineText, index + 1, findings);
    });

    return findings;
  }

  private evaluateLineAgainstRules(lineText: string, lineNumber: number, findings: SastFinding[]): void {
    SECRET_RULES.forEach((rule) => {
      if (rule.regex.test(lineText)) {
        findings.push(this.buildSecretFinding(rule, lineNumber, lineText.trim()));
      }
      rule.regex.lastIndex = 0; // Reset regex state
    });
  }

  private buildSecretFinding(rule: typeof SECRET_RULES[0], lineNumber: number, snippet: string): SastFinding {
    return {
      id: generateId('sec'),
      type: 'SECRET_EXPOSED',
      severity: rule.severity,
      ruleId: rule.id,
      title: rule.title,
      description: `Se identificó un patrón correspondiente a ${rule.title} en la línea ${lineNumber}.`,
      lineNumber,
      snippet,
      recommendation: rule.recommendation,
    };
  }
}