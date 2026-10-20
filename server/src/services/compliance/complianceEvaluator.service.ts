import { getDbPool } from '../../config/database.js';
import type { StandardComplianceSummary, ComplianceControlStatus, ComplianceRadarResponse } from '../../modules/compliance/compliance.types.js';

export class ComplianceEvaluatorService {
  public async evaluateGlobalCompliance(targetFilter?: string): Promise<{
    overallComplianceScore: number;
    standards: Record<string, StandardComplianceSummary>;
    availableTargets: string[];
  }> {
    const pool = getDbPool();
    const allFindings: Array<{ sourceModule: string; title: string; severity: string; description: string; recommendation?: string }> = [];
    const targetsSet = new Set<string>();

    const filterTerm = targetFilter ? targetFilter.trim().toLowerCase() : null;

    // Helper para verificar si un registro coincide con el filtro seleccionado
    const matchesFilter = (...fields: Array<string | undefined | null>): boolean => {
      // Registrar objetivos disponibles para la lista desplegable del filtro
      fields.forEach((f) => {
        if (f && f.trim().length > 0 && f !== 'N/A') {
          targetsSet.add(f.trim());
        }
      });

      if (!filterTerm) return true; // Si no hay filtro, incluye todo (Modo General)

      return fields.some((f) => f && f.toLowerCase().includes(filterTerm));
    };

    // 1. SAST
    try {
      const [sastRows]: any = await pool.query('SELECT * FROM sast_audits');
      for (const row of sastRows) {
        if (matchesFilter(row.file_name, row.fileName)) {
          const findings = row.findings_json ? JSON.parse(row.findings_json) : (row.findings ? JSON.parse(row.findings) : []);
          findings.forEach((f: any) => {
            allFindings.push({
              sourceModule: 'SAST',
              title: f.title || 'Vulnerabilidad de Código',
              severity: f.severity || 'MEDIUM',
              description: f.description || '',
              recommendation: f.recommendation,
            });
          });
        }
      }
    } catch {
      try {
        const [sastRowsAlt]: any = await pool.query('SELECT * FROM sast_history');
        for (const row of sastRowsAlt) {
          if (matchesFilter(row.file_name, row.fileName)) {
            const findings = row.findings_json ? JSON.parse(row.findings_json) : [];
            findings.forEach((f: any) => {
              allFindings.push({
                sourceModule: 'SAST',
                title: f.title || 'Vulnerabilidad de Código',
                severity: f.severity || 'MEDIUM',
                description: f.description || '',
                recommendation: f.recommendation,
              });
            });
          }
        }
      } catch {
        // Ignorar si no existe
      }
    }

    // 2. DAST
    try {
      const [dastRows]: any = await pool.query('SELECT * FROM dast_history');
      for (const row of dastRows) {
        if (matchesFilter(row.target_base_url, row.targetBaseUrl)) {
          const findings = row.findings_json ? JSON.parse(row.findings_json) : [];
          findings.forEach((f: any) => {
            allFindings.push({
              sourceModule: 'DAST',
              title: f.vulnerabilityType || f.title || 'Falla Dinámica API',
              severity: f.severity || 'HIGH',
              description: f.description || '',
              recommendation: f.remediation,
            });
          });
        }
      }
    } catch {
      // Ignorar
    }

    // 3. SCA
    try {
      const [scaRows]: any = await pool.query('SELECT * FROM sca_history');
      for (const row of scaRows) {
        if (matchesFilter(row.manifest_type, row.manifestType)) {
          const vulns = row.vulnerabilities_json ? JSON.parse(row.vulnerabilities_json) : [];
          const secrets = row.git_secrets_json ? JSON.parse(row.git_secrets_json) : [];
          vulns.forEach((v: any) => {
            allFindings.push({
              sourceModule: 'SCA',
              title: `Librería Vulnerable: ${v.packageName}`,
              severity: v.severity || 'HIGH',
              description: v.description || '',
              recommendation: `Actualizar a ${v.patchedVersion || 'versión segura'}`,
            });
          });
          secrets.forEach((s: any) => {
            allFindings.push({
              sourceModule: 'SCA (Secret Scanning)',
              title: `Secreto Expuesto: ${s.secretType}`,
              severity: 'CRITICAL',
              description: `Coincidencia en ${s.filePath}`,
              recommendation: 'Rotar credencial expuesta inmediatamente',
            });
          });
        }
      }
    } catch {
      // Ignorar
    }

    // 4. Red Team
    try {
      const [redteamRows]: any = await pool.query('SELECT * FROM redteam_history');
      for (const row of redteamRows) {
        if (matchesFilter(row.target_url, row.targetUrl)) {
          const jwts = row.jwt_findings_json ? JSON.parse(row.jwt_findings_json) : [];
          const cors = row.cors_findings_json ? JSON.parse(row.cors_findings_json) : [];
          jwts.forEach((j: any) => {
            allFindings.push({
              sourceModule: 'Red Team (JWT)',
              title: `Falla JWT: ${j.vulnerabilityType}`,
              severity: j.severity || 'HIGH',
              description: j.description || '',
              recommendation: j.remediation,
            });
          });
          cors.forEach((c: any) => {
            allFindings.push({
              sourceModule: 'Red Team (CORS)',
              title: `Falla CORS: ${c.vulnerabilityType}`,
              severity: c.severity || 'MEDIUM',
              description: c.description || '',
              recommendation: c.remediation,
            });
          });
        }
      }
    } catch {
      // Ignorar
    }

    // 5. Email Security
    try {
      const [emailsecRows]: any = await pool.query('SELECT * FROM emailsec_history');
      for (const row of emailsecRows) {
        if (matchesFilter(row.target_domain, row.targetDomain, row.target_ip, row.targetIp)) {
          const dmarc = row.dmarc_json ? JSON.parse(row.dmarc_json) : null;
          if (dmarc && (!dmarc.valid || dmarc.policy === 'none' || dmarc.policy === 'MISSING')) {
            allFindings.push({
              sourceModule: 'EmailSec',
              title: 'Política DMARC Débil o Ausente',
              severity: 'HIGH',
              description: 'El dominio permite suplantación de identidad (spoofing).',
              recommendation: 'Configurar DMARC p=quarantine o p=reject',
            });
          }
        }
      }
    } catch {
      // Ignorar
    }

    // 6. Evaluación de Controles Normativos
    const owaspControls = this.evaluateOwaspTop10(allFindings);
    const isoControls = this.evaluateIso27001(allFindings);
    const nistControls = this.evaluateNist80053(allFindings);

    const owaspScore = this.calculatePercentage(owaspControls);
    const isoScore = this.calculatePercentage(isoControls);
    const nistScore = this.calculatePercentage(nistControls);

    const overallComplianceScore = Math.round((owaspScore + isoScore + nistScore) / 3);

    return {
      overallComplianceScore,
      availableTargets: Array.from(targetsSet),
      standards: {
        OWASP_2021: {
          standard: 'OWASP_2021',
          standardName: 'OWASP Top 10 (2021)',
          totalControls: owaspControls.length,
          passedControls: owaspControls.filter((c) => c.status === 'PASSED').length,
          failedControls: owaspControls.filter((c) => c.status === 'FAILED').length,
          compliancePercentage: owaspScore,
          controls: owaspControls,
        },
        ISO27001: {
          standard: 'ISO27001',
          standardName: 'ISO/IEC 27001:2022 (Annex A)',
          totalControls: isoControls.length,
          passedControls: isoControls.filter((c) => c.status === 'PASSED').length,
          failedControls: isoControls.filter((c) => c.status === 'FAILED').length,
          compliancePercentage: isoScore,
          controls: isoControls,
        },
        NIST_800_53: {
          standard: 'NIST_800_53',
          standardName: 'NIST SP 800-53 Rev. 5',
          totalControls: nistControls.length,
          passedControls: nistControls.filter((c) => c.status === 'PASSED').length,
          failedControls: nistControls.filter((c) => c.status === 'FAILED').length,
          compliancePercentage: nistScore,
          controls: nistControls,
        },
      },
    };
  }

  public async getAvailableTargets(): Promise<string[]> {
    const pool = getDbPool();
    const targetsSet = new Set<string>();

    const addTarget = (val?: string) => {
      if (val && val.trim().length > 0 && val !== 'N/A') {
        targetsSet.add(val.trim());
      }
    };

    try {
      const [sastRows]: any = await pool.query('SELECT file_name FROM sast_audits');
      sastRows.forEach((r: any) => addTarget(r.file_name));
    } catch {
      try {
        const [sastRowsAlt]: any = await pool.query('SELECT file_name FROM sast_history');
        sastRowsAlt.forEach((r: any) => addTarget(r.file_name));
      } catch {
        /* ignore */
      }
    }

    try {
      const [dastRows]: any = await pool.query('SELECT target_base_url FROM dast_history');
      dastRows.forEach((r: any) => addTarget(r.target_base_url));
    } catch {
      /* ignore */
    }

    try {
      const [redteamRows]: any = await pool.query('SELECT target_url FROM redteam_history');
      redteamRows.forEach((r: any) => addTarget(r.target_url));
    } catch {
      /* ignore */
    }

    try {
      const [emailsecRows]: any = await pool.query('SELECT target_domain, target_ip FROM emailsec_history');
      emailsecRows.forEach((r: any) => {
        addTarget(r.target_domain);
        addTarget(r.target_ip);
      });
    } catch {
      /* ignore */
    }

    return Array.from(targetsSet);
  }

  private calculatePercentage(controls: ComplianceControlStatus[]): number {
    if (controls.length === 0) return 100;
    const passed = controls.filter((c) => c.status === 'PASSED').length;
    return Math.round((passed / controls.length) * 100);
  }

  private evaluateOwaspTop10(findings: any[]): ComplianceControlStatus[] {
    const categories = [
      { id: 'A01:2021', title: 'Broken Access Control', keywords: ['BOLA', 'IDOR', 'CORS', 'Access Control', 'Permisos'] },
      { id: 'A02:2021', title: 'Cryptographic Failures', keywords: ['Secret', 'Token', 'Key', 'RSA', 'SSL', 'TLS', 'JWT', 'Cryptographic'] },
      { id: 'A03:2021', title: 'Injection', keywords: ['SQL', 'Inyección', 'Injection', 'XSS', 'CRLF', 'Header Injection'] },
      { id: 'A04:2021', title: 'Insecure Design', keywords: ['Rate Limit', 'DoS', 'Carga', 'Diseño'] },
      { id: 'A05:2021', title: 'Security Misconfiguration', keywords: ['DMARC', 'SPF', 'DNS', 'Configuración', 'Server Header'] },
      { id: 'A06:2021', title: 'Vulnerable and Outdated Components', keywords: ['Librería', 'Dependencia', 'SCA', 'Package', 'Outdated'] },
      { id: 'A07:2021', title: 'Identification and Authentication Failures', keywords: ['Autenticación', 'JWT', 'Phishing', 'Spoofing'] },
    ];

    return categories.map((cat) => {
      const matches = findings.filter((f) =>
        cat.keywords.some((kw) => f.title.toLowerCase().includes(kw.toLowerCase()) || f.description.toLowerCase().includes(kw.toLowerCase()))
      );
      return {
        controlId: cat.id,
        title: cat.title,
        category: 'OWASP Top 10',
        status: matches.length === 0 ? 'PASSED' : 'FAILED',
        failingFindingsCount: matches.length,
        mappedSources: Array.from(new Set(matches.map((m) => m.sourceModule))),
        findingsDetails: matches.map((m) => ({ sourceModule: m.sourceModule, title: m.title, severity: m.severity, recommendation: m.recommendation })),
      };
    });
  }

  private evaluateIso27001(findings: any[]): ComplianceControlStatus[] {
    const categories = [
      { id: 'A.8.8', title: 'Management of Technical Vulnerabilities', keywords: ['Librería', 'Dependencia', 'SCA', 'Vulnerabilidad'] },
      { id: 'A.8.12', title: 'Data Leakage Prevention', keywords: ['Secret', 'Token', 'Key', 'Expuesto'] },
      { id: 'A.8.28', title: 'Secure Coding', keywords: ['SQL', 'Inyección', 'SAST', 'XSS', 'Código'] },
      { id: 'A.8.20', title: 'Network Security', keywords: ['Puerto', 'Red', 'DNS', 'EASM'] },
      { id: 'A.8.24', title: 'Use of Cryptography', keywords: ['JWT', 'SSL', 'TLS', 'Firma'] },
    ];

    return categories.map((cat) => {
      const matches = findings.filter((f) =>
        cat.keywords.some((kw) => f.title.toLowerCase().includes(kw.toLowerCase()) || f.description.toLowerCase().includes(kw.toLowerCase()))
      );
      return {
        controlId: cat.id,
        title: cat.title,
        category: 'ISO 27001 Annex A',
        status: matches.length === 0 ? 'PASSED' : 'FAILED',
        failingFindingsCount: matches.length,
        mappedSources: Array.from(new Set(matches.map((m) => m.sourceModule))),
        findingsDetails: matches.map((m) => ({ sourceModule: m.sourceModule, title: m.title, severity: m.severity, recommendation: m.recommendation })),
      };
    });
  }

  private evaluateNist80053(findings: any[]): ComplianceControlStatus[] {
    const categories = [
      { id: 'SI-10', title: 'Information Input Validation', keywords: ['Inyección', 'Input', 'SQL', 'XSS', 'BOLA'] },
      { id: 'IA-2', title: 'Identification and Authentication', keywords: ['JWT', 'Autenticación', 'DMARC', 'Spoofing'] },
      { id: 'SC-8', title: 'Transmission Confidentiality and Integrity', keywords: ['SSL', 'TLS', 'CORS', 'Criptografía'] },
      { id: 'SA-11', title: 'Developer Security Testing', keywords: ['SAST', 'DAST', 'Dependencia', 'SCA'] },
    ];

    return categories.map((cat) => {
      const matches = findings.filter((f) =>
        cat.keywords.some((kw) => f.title.toLowerCase().includes(kw.toLowerCase()) || f.description.toLowerCase().includes(kw.toLowerCase()))
      );
      return {
        controlId: cat.id,
        title: cat.title,
        category: 'NIST SP 800-53',
        status: matches.length === 0 ? 'PASSED' : 'FAILED',
        failingFindingsCount: matches.length,
        mappedSources: Array.from(new Set(matches.map((m) => m.sourceModule))),
        findingsDetails: matches.map((m) => ({ sourceModule: m.sourceModule, title: m.title, severity: m.severity, recommendation: m.recommendation })),
      };
    });
  }
}