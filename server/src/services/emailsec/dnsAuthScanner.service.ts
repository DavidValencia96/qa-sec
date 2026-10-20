import dns from 'dns/promises';
import type { SpfRecordResult, DmarcRecordResult, DkimRecordResult } from '../../modules/emailsec/emailsec.types.js';

export class DnsAuthScannerService {
  /**
   * Audita el registro SPF real de un dominio
   */
  public async auditSpf(domain: string): Promise<SpfRecordResult> {
    const warnings: string[] = [];
    try {
      const txtRecords = await dns.resolveTxt(domain);
      const spfRow = txtRecords.map((r) => r.join('')).find((r) => r.startsWith('v=spf1'));

      if (!spfRow) {
        return {
          raw: null,
          valid: false,
          policy: 'MISSING',
          lookupCount: 0,
          warnings: ['No se encontró ningún registro TXT SPF (v=spf1) configurado en el DNS.'],
        };
      }

      // Conteo de lookups (include, a, mx, ptr, exists)
      const lookups = (spfRow.match(/(include:|a|mx|ptr|exists:)/gi) || []).length;
      if (lookups > 10) {
        warnings.push(`Límite de lookups DNS excedido: tiene ${lookups} mecanismos de consulta (Máximo permitido RFC 7208 es 10).`);
      }

      let policy: SpfRecordResult['policy'] = 'NEUTRAL';
      if (spfRow.includes('-all')) {
        policy = 'STRICT_FAIL';
      } else if (spfRow.includes('~all')) {
        policy = 'SOFT_FAIL';
      } else if (spfRow.includes('+all')) {
        policy = 'ALLOW_ALL';
        warnings.push('CRÍTICO: El registro usa +all, permitiendo que cualquier servidor envíe correo en nombre de este dominio.');
      } else if (!spfRow.includes('all')) {
        warnings.push('El registro SPF no incluye un mecanismo explícito de terminación (all).');
      }

      return {
        raw: spfRow,
        valid: true,
        policy,
        lookupCount: lookups,
        warnings,
      };
    } catch (error) {
      return {
        raw: null,
        valid: false,
        policy: 'MISSING',
        lookupCount: 0,
        warnings: [`Error consultando registros DNS TXT: ${(error as Error).message}`],
      };
    }
  }

  /**
   * Audita el registro DMARC real (_dmarc.domain)
   */
  public async auditDmarc(domain: string): Promise<DmarcRecordResult> {
    const warnings: string[] = [];
    const dmarcHost = `_dmarc.${domain}`;

    try {
      const txtRecords = await dns.resolveTxt(dmarcHost);
      const dmarcRow = txtRecords.map((r) => r.join('')).find((r) => r.startsWith('v=DMARC1'));

      if (!dmarcRow) {
        return {
          raw: null,
          valid: false,
          policy: 'MISSING',
          ruaConfigured: false,
          alignmentSpf: 'r',
          alignmentDkim: 'r',
          warnings: ['No existe registro DMARC (_dmarc.' + domain + '). El dominio es vulnerable a spoofing directo.'],
        };
      }

      const policyMatch = dmarcRow.match(/p=(none|quarantine|reject)/i);
      const policy = policyMatch ? (policyMatch[1].toLowerCase() as DmarcRecordResult['policy']) : 'none';

      if (policy === 'none') {
        warnings.push('Política p=none configurada. DMARC solo monitorea pero NO bloquea el correo suplantado.');
      }

      const ruaConfigured = /rua=mailto:/i.test(dmarcRow);
      if (!ruaConfigured) {
        warnings.push('No se configuró una dirección de reportes (rua). No recibirá alertas de intentos de suplantación.');
      }

      const aspfMatch = dmarcRow.match(/aspf=(r|s)/i);
      const adkimMatch = dmarcRow.match(/adkim=(r|s)/i);

      return {
        raw: dmarcRow,
        valid: true,
        policy,
        ruaConfigured,
        alignmentSpf: aspfMatch ? (aspfMatch[1].toLowerCase() as 'r' | 's') : 'r',
        alignmentDkim: adkimMatch ? (adkimMatch[1].toLowerCase() as 'r' | 's') : 'r',
        warnings,
      };
    } catch {
      return {
        raw: null,
        valid: false,
        policy: 'MISSING',
        ruaConfigured: false,
        alignmentSpf: 'r',
        alignmentDkim: 'r',
        warnings: [`Registro DMARC no encontrado en ${dmarcHost}.`],
      };
    }
  }

  /**
   * Consulta el registro DKIM TXT real para un selector específico
   */
  public async auditDkim(domain: string, selector: string = 'google'): Promise<DkimRecordResult> {
    const warnings: string[] = [];
    const dkimHost = `${selector}._domainkey.${domain}`;

    try {
      const txtRecords = await dns.resolveTxt(dkimHost);
      const dkimRow = txtRecords.map((r) => r.join('')).find((r) => r.includes('v=DKIM1') || r.includes('p='));

      if (!dkimRow) {
        return {
          selector,
          raw: null,
          exists: false,
          warnings: [`No se encontró registro DKIM en el selector '${selector}' (${dkimHost}).`],
        };
      }

      const pMatch = dkimRow.match(/p=([A-Za-z0-9+/=]+)/);
      let keyLengthBits = 0;
      if (pMatch && pMatch[1]) {
        // Estimar la longitud de la llave en bits a partir del Base64
        const buffer = Buffer.from(pMatch[1], 'base64');
        keyLengthBits = buffer.length * 8;
        if (keyLengthBits < 1024) {
          warnings.push(`Llave RSA débil detectada (${keyLengthBits} bits). Se recomienda usar al menos 2048 bits.`);
        }
      }

      return {
        selector,
        raw: dkimRow,
        exists: true,
        keyLengthBits,
        warnings,
      };
    } catch {
      return {
        selector,
        raw: null,
        exists: false,
        warnings: [`No se pudo resolver el registro DKIM para ${dkimHost}.`],
      };
    }
  }
}