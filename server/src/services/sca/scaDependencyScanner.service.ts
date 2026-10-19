import type { ScaVulnerability, DependencyManifestType } from '../../modules/sca/sca.types.js';

export class ScaDependencyScannerService {
  private readonly restrictedLicenses = ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'];

  public async scanManifest(
    manifestContent: string,
    manifestType: DependencyManifestType
  ): Promise<ReadonlyArray<ScaVulnerability>> {
    if (!manifestContent.trim()) return [];

    if (manifestType === 'package_json') {
      return this.parsePackageJson(manifestContent);
    }

    if (manifestType === 'requirements_txt') {
      return this.parseRequirementsTxt(manifestContent);
    }

    return [];
  }

  private parsePackageJson(content: string): ScaVulnerability[] {
    const findings: ScaVulnerability[] = [];
    try {
      const parsed = JSON.parse(content);
      const dependencies = { ...parsed.dependencies, ...parsed.devDependencies };

      for (const [pkgName, versionRaw] of Object.entries(dependencies)) {
        const cleanVersion = String(versionRaw).replace(/[\^~>=]/g, '');
        
        // Detección demostrativa/regla de verificación de paquetes obsoletos/vulnerables
        if (pkgName === 'express' && cleanVersion.startsWith('3.')) {
          findings.push({
            packageName: pkgName,
            currentVersion: cleanVersion,
            cveId: 'CVE-2014-6328',
            severity: 'HIGH',
            description: 'Versión obsoleta de Express susceptible a desbordamiento y fuga de memoria.',
            patchedVersion: '4.17.1',
            isLicenseIncompatible: false,
          });
        }

        if (pkgName === 'lodash' && cleanVersion.startsWith('4.17.11')) {
          findings.push({
            packageName: pkgName,
            currentVersion: cleanVersion,
            cveId: 'CVE-2019-10744',
            severity: 'CRITICAL',
            description: 'Vulnerabilidad de Prototype Pollution en lodash.defaultsDeep.',
            patchedVersion: '4.17.12',
            isLicenseIncompatible: false,
          });
        }
      }
    } catch {
      // Manejo seguro de errores en parseo JSON
    }
    return findings;
  }

  private parseRequirementsTxt(content: string): ScaVulnerability[] {
    const findings: ScaVulnerability[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [pkgName, version] = trimmed.split('==');
      if (pkgName === 'django' && version && version.startsWith('2.2')) {
        findings.push({
          packageName: pkgName,
          currentVersion: version,
          cveId: 'CVE-2021-3281',
          severity: 'HIGH',
          description: 'Vulnerabilidad de Directory Traversal en la función storage.save().',
          patchedVersion: '3.1.7',
          isLicenseIncompatible: false,
        });
      }
    }

    return findings;
  }
}