export const SYSTEM_MODULES_LIST = [
  { key: 'SAST', label: 'SAST (Código Estático)' },
  { key: 'DAST', label: 'DAST (Pruebas Dinámicas)' },
  { key: 'SCA', label: 'SCA (Dependencias)' },
  { key: 'EASM', label: 'EASM (Superficie Externa)' },
  { key: 'REDTEAM', label: 'Red Team / Autenticación' },
  { key: 'EMAILSEC', label: 'Email Security / DNS' },
  { key: 'LOADTEST', label: 'Pruebas de Carga' },
  { key: 'NETWORK', label: 'Escaneo de Red' },
  { key: 'COMPLIANCE', label: 'Cumplimiento Normativo' },
  { key: 'REPORTS', label: 'Reportes y Hallazgos' },
  { key: 'CVE', label: 'Radar CVE & CiberThreat Feed' },
] as const;

export type SystemModuleKey = (typeof SYSTEM_MODULES_LIST)[number]['key'];

export const DEFAULT_ROLE_MODULES: Record<string, string[]> = {
  ADMIN: [
    'SAST',
    'DAST',
    'SCA',
    'EASM',
    'REDTEAM',
    'EMAILSEC',
    'LOADTEST',
    'NETWORK',
    'COMPLIANCE',
    'REPORTS',
    'CVE',
  ],
  AUDITOR: ['SAST', 'DAST', 'SCA', 'LOADTEST', 'NETWORK', 'REPORTS', 'CVE'],
  VIEWER: ['REPORTS', 'COMPLIANCE', 'CVE'],
};