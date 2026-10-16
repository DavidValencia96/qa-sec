export interface SecretRule {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  regex: RegExp;
  recommendation: string;
}

export const SECRET_RULES: SecretRule[] = [
  {
    id: 'SEC-AWS-KEY',
    title: 'Clave de Acceso de AWS Detectada',
    severity: 'CRITICAL',
    regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    recommendation: 'Remover la clave de AWS del código. Utilizar variables de entorno o AWS IAM Roles.',
  },
  {
    id: 'SEC-JWT-TOKEN',
    title: 'Token JWT Hardcodeado',
    severity: 'HIGH',
    regex: /ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    recommendation: 'Nunca almacenar Tokens JWT en texto plano dentro del código fuente.',
  },
  {
    id: 'SEC-GENERIC-API-KEY',
    title: 'Posible API Key o Secret Hardcodeado',
    severity: 'HIGH',
    regex: /(api_key|apikey|secret_key|api_secret|auth_token)\s*[:=]\s*["']([A-Za-z0-9_\-]{16,})["']/gi,
    recommendation: 'Mover secrets y tokens a un archivo .env no rastreado por Git.',
  },
  {
    id: 'SEC-PRIVATE-KEY',
    title: 'Clave Privada RSA / SSH Detectada',
    severity: 'CRITICAL',
    regex: /-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----/g,
    recommendation: 'Eliminar claves privadas del código fuente e incluirlas mediante Secrets Manager.',
  },
];