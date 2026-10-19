import dns from 'dns/promises';
import tls from 'tls';
import type {
  DnsRecordItem,
  SubdomainItem,
  WafTechnologyDetails,
  SslCertificateDetails,
} from '../../modules/easm/easm.types.js';

export class EasmScannerService {
  /**
   * Resuelve registros DNS principales (A, MX, TXT, NS)
   */
  public async resolveDnsRecords(domain: string): Promise<DnsRecordItem[]> {
    const records: DnsRecordItem[] = [];
    const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0];

    try {
      const aRecords = await dns.resolve4(cleanDomain).catch(() => []);
      aRecords.forEach((ip) => records.push({ type: 'A', value: ip }));

      const mxRecords = await dns.resolveMx(cleanDomain).catch(() => []);
      mxRecords.forEach((mx) => records.push({ type: 'MX', value: `${mx.exchange} (prioridad: ${mx.priority})` }));

      const txtRecords = await dns.resolveTxt(cleanDomain).catch(() => []);
      txtRecords.forEach((txt) => records.push({ type: 'TXT', value: txt.join(' ') }));

      const nsRecords = await dns.resolveNs(cleanDomain).catch(() => []);
      nsRecords.forEach((ns) => records.push({ type: 'NS', value: ns }));
    } catch (error) {
      console.warn(`[!] Advertencia al resolver DNS para ${cleanDomain}:`, (error as Error).message);
    }

    return records;
  }

  /**
   * Mapeo y descubrimiento de subdominios comunes
   */
  public async discoverSubdomains(domain: string): Promise<SubdomainItem[]> {
    const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0];
    const commonPrefixes = ['api', 'dev', 'staging', 'mail', 'vpn', 'admin', 'portal', 'test'];
    const results: SubdomainItem[] = [];

    for (const prefix of commonPrefixes) {
      const targetSub = `${prefix}.${cleanDomain}`;
      try {
        const ips = await dns.resolve4(targetSub);
        if (ips.length > 0) {
          results.push({
            subdomain: targetSub,
            ipAddress: ips[0],
            status: 'ACTIVE',
          });
        }
      } catch {
        // Subdominio no existe o no resuelve
      }
    }

    return results;
  }

  /**
   * Detección pasiva de WAF y stack tecnológico mediante encabezados HTTP
   */
  public async detectWafAndTech(domain: string): Promise<WafTechnologyDetails> {
    const url = /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
    let wafDetected = false;
    let wafName: WafTechnologyDetails['wafName'] = undefined;
    let serverHeader = 'Desconocido';
    const detectedTechStack: string[] = [];

    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      serverHeader = response.headers.get('server') || 'No revelado';

      const cfRay = response.headers.get('cf-ray');
      const serverLower = serverHeader.toLowerCase();

      if (cfRay || serverLower.includes('cloudflare')) {
        wafDetected = true;
        wafName = 'Cloudflare';
        detectedTechStack.push('Cloudflare CDN/WAF');
      } else if (serverLower.includes('amazonaws') || response.headers.get('x-amz-cf-id')) {
        wafDetected = true;
        wafName = 'AWS WAF';
        detectedTechStack.push('AWS CloudFront / WAF');
      } else if (serverLower.includes('nginx')) {
        detectedTechStack.push('Nginx Reverse Proxy');
      }

      if (response.headers.get('x-powered-by')) {
        detectedTechStack.push(`Backend: ${response.headers.get('x-powered-by')}`);
      }
    } catch (err) {
      console.warn(`[!] No se pudo completar petición HTTP para WAF en ${url}:`, (err as Error).message);
    }

    return {
      wafDetected,
      wafName,
      serverHeader,
      detectedTechStack,
    };
  }

  /**
   * Auditoría de Certificado SSL/TLS y suites de cifrado
   */
  public async auditSslCertificate(domain: string): Promise<SslCertificateDetails> {
    const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0];

    return new Promise((resolve) => {
      const socket = tls.connect(443, cleanDomain, { servername: cleanDomain, timeout: 5000 }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          resolve({ valid: false, weakProtocolsDetected: [] });
          return;
        }

        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.ceil((validTo.getTime() - Date.now()) / (1000 * 3600 * 24));

        // Helper para normalizar string | string[] | undefined a string | undefined
        const normalizeCertField = (val: string | string[] | undefined): string | undefined => {
          if (Array.isArray(val)) return val.join(', ');
          return val;
        };

        const issuerOrg = normalizeCertField(cert.issuer?.O);
        const issuerCn = normalizeCertField(cert.issuer?.CN);
        const resolvedIssuer = issuerOrg || issuerCn || String(cert.issuer);

        resolve({
          valid: daysRemaining > 0,
          issuer: resolvedIssuer,
          validTo: validTo.toISOString(),
          daysRemaining,
          weakProtocolsDetected: daysRemaining < 15 ? ['Certificado próximo a expirar (< 15 días)'] : [],
        });
      });

      socket.on('error', () => {
        resolve({ valid: false, weakProtocolsDetected: ['Falló la conexión SSL/TLS segura'] });
      });

      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve({ valid: false, weakProtocolsDetected: ['Tiempo de espera agotado al validar SSL'] });
      });
    });
  }
}