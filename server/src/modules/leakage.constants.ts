export interface LeakagePatternRule {
  regex: RegExp;
  severity: 'CRITICAL' | 'HIGH' | 'LOW';
  title: string;
}

export const LEAKAGE_PATTERNS: LeakagePatternRule[] = [
  {
    regex: /TODO:/gi,
    severity: 'LOW',
    title: 'Comentario TODO en Producción',
  },
  {
    regex: /("|\')?secret("|\')?\s*:\s*("|\')[^"\'\s]+("|\')/gi,
    severity: 'HIGH',
    title: 'Posible Secret/API Key Hardcodeada',
  },
  {
    regex: /("|\')?password("|\')?\s*:\s*("|\')[^"\'\s]+("|\')/gi,
    severity: 'CRITICAL',
    title: 'Posible Contraseña Hardcodeada',
  },
];