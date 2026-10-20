import dns from 'dns/promises';
import type { RblCheckResult } from '../../modules/emailsec/emailsec.types.js';

const RBL_PROVIDERS = [
  'zen.spamhaus.org',
  'b.barracudacentral.org',
  'bl.spamcop.net',
  'dnsbl.sorbs.net',
  'spam.dnsbl.sorbs.net',
];

export class RblScannerService {
  /**
   * Invierte una dirección IPv4 y consulta servidores DNSBL reales
   */
  public async checkIpReputation(ip: string): Promise<RblCheckResult> {
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
    if (!isIPv4) {
      throw new Error(`Dirección IP inválida para consulta RBL: ${ip}`);
    }

    const reversedIp = ip.split('.').reverse().join('.');
    const listedIn: string[] = [];
    const cleanIn: string[] = [];

    const promises = RBL_PROVIDERS.map(async (provider) => {
      const queryHost = `${reversedIp}.${provider}`;
      try {
        await dns.resolve4(queryHost);
        listedIn.push(provider);
      } catch {
        cleanIn.push(provider);
      }
    });

    await Promise.allSettled(promises);

    return {
      ip,
      blacklisted: listedIn.length > 0,
      listedIn,
      cleanIn,
    };
  }
}