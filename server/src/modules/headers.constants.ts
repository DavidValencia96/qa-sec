export interface HeaderRule {
  key: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  recommendation: string;
}

export const SECURITY_HEADER_RULES: HeaderRule[] = [
  {
    key: 'content-security-policy',
    severity: 'HIGH',
    title: 'Falta Content-Security-Policy (CSP)',
    recommendation: 'Configurar CSP para prevenir ataques de inyección XSS, clickjacking y scripts no autorizados.',
  },
  {
    key: 'x-frame-options',
    severity: 'MEDIUM',
    title: 'Falta X-Frame-Options',
    recommendation: 'Configurar DENY o SAMEORIGIN para evitar ataques de Clickjacking.',
  },
  {
    key: 'strict-transport-security',
    severity: 'HIGH',
    title: 'Falta HSTS (Strict-Transport-Security)',
    recommendation: 'Habilitar HSTS (min-age=31536000; includeSubDomains) para forzar HTTPS.',
  },
  {
    key: 'x-content-type-options',
    severity: 'MEDIUM',
    title: 'Falta X-Content-Type-Options',
    recommendation: 'Establecer en "nosniff" para prevenir la interpretación incorrecta del tipo MIME (MIME Sniffing).',
  },
  {
    key: 'referrer-policy',
    severity: 'LOW',
    title: 'Falta Referrer-Policy',
    recommendation: 'Establecer en "no-referrer-when-downgrade" o "strict-origin-when-cross-origin" para evitar fugas de URLs privadas.',
  },
  {
    key: 'permissions-policy',
    severity: 'LOW',
    title: 'Falta Permissions-Policy (Feature-Policy)',
    recommendation: 'Restringir el acceso del navegador a la cámara, micrófono, geolocalización y APIs sensibles.',
  },
  {
    key: 'cross-origin-opener-policy',
    severity: 'LOW',
    title: 'Falta Cross-Origin-Opener-Policy (COOP)',
    recommendation: 'Establecer en "same-origin" para aislar el contexto de navegación y mitigar ataques Spectre/XS-Leaks.',
  },
];