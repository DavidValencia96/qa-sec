import type { SastFinding } from '../../modules/sast/sast.types.js';
import { generateId } from '../../utils/id.generator.js';

export class DependencyScannerService {
  public scanPackageJson(content: string): SastFinding[] {
    try {
      const parsed = JSON.parse(content);
      const dependencies = { ...parsed.dependencies, ...parsed.devDependencies };
      const findings: SastFinding[] = [];

      Object.entries(dependencies).forEach(([pkg, version]) => {
        this.evaluateDependency(pkg, String(version), findings);
      });

      return findings;
    } catch {
      return [this.buildInvalidJsonFinding()];
    }
  }

  private evaluateDependency(pkg: string, version: string, findings: SastFinding[]): void {
    // Reglas de ejemplo para paquetes conocidos con versiones vulnerables
    if (pkg === 'express' && version.includes('4.16.')) {
      findings.push(this.buildDepFinding(pkg, version, 'MEDIUM', 'Versión de Express propensa a denegación de servicio en body-parser.'));
    } else if (pkg === 'lodash' && (version.includes('4.17.11') || version.includes('4.17.15'))) {
      findings.push(this.buildDepFinding(pkg, version, 'HIGH', 'Vulnerabilidad de Prototype Pollution en Lodash.'));
    } else if (version.startsWith('^') || version.startsWith('~')) {
      // Advertencia de buenas prácticas sobre versiones no fijadas
      findings.push(this.buildDepFinding(pkg, version, 'INFO', 'La versión utiliza rangos dinámicos (^/~). Se sugiere fijar la versión exacta.'));
    }
  }

  private buildDepFinding(pkg: string, version: string, severity: 'HIGH' | 'MEDIUM' | 'INFO', desc: string): SastFinding {
    return {
      id: generateId('dep'),
      type: 'VULNERABLE_DEPENDENCY',
      severity,
      ruleId: `DEP-${pkg.toUpperCase()}`,
      title: `Dependencia ${pkg}@${version}`,
      description: desc,
      recommendation: `Actualizar la librería ${pkg} a la última versión parcheada estable.`,
    };
  }

  private buildInvalidJsonFinding(): SastFinding {
    return {
      id: generateId('dep'),
      type: 'VULNERABLE_DEPENDENCY',
      severity: 'HIGH',
      ruleId: 'DEP-INVALID-JSON',
      title: 'Archivo package.json Inválido',
      description: 'El contenido proporcionado no posee una estructura JSON válida.',
      recommendation: 'Corregir la sintaxis del archivo package.json.',
    };
  }
}