import type { HeaderAnalysisResult } from '../../modules/emailsec/emailsec.types.js';

export class HeaderParserService {
  public parseRawHeaders(rawHeaders: string): HeaderAnalysisResult {
    const lines = rawHeaders.split(/\r?\n/);
    const anomalies: string[] = [];

    let fromAddress = '';
    let returnPath = '';
    let spfHeaderStatus = 'UNKNOWN';
    let dkimHeaderStatus = 'UNKNOWN';
    const hops: HeaderAnalysisResult['hops'] = [];

    let hopCount = 1;

    for (const line of lines) {
      if (/^From:/i.test(line)) {
        fromAddress = line.replace(/^From:\s*/i, '').trim();
      } else if (/^Return-Path:/i.test(line)) {
        returnPath = line.replace(/^Return-Path:\s*/i, '').trim();
      } else if (/^Received-SPF:/i.test(line) || /^Authentication-Results:.*spf=/i.test(line)) {
        if (/pass/i.test(line)) spfHeaderStatus = 'PASS';
        else if (/fail/i.test(line)) spfHeaderStatus = 'FAIL';
        else if (/softfail/i.test(line)) spfHeaderStatus = 'SOFTFAIL';
      } else if (/^DKIM-Signature:/i.test(line)) {
        dkimHeaderStatus = 'PRESENT';
      } else if (/^Received:/i.test(line)) {
        const ipMatch = line.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
        const fromMatch = line.match(/from\s+([^\s]+)/i);
        const byMatch = line.match(/by\s+([^\s]+)/i);

        if (ipMatch) {
          hops.push({
            hopNumber: hopCount++,
            fromHost: fromMatch ? fromMatch[1] : 'Unknown',
            byHost: byMatch ? byMatch[1] : 'Unknown',
            ip: ipMatch[1],
          });
        }
      }
    }

    // Análisis de Detección de Spoofing
    const cleanFromDomain = this.extractDomain(fromAddress);
    const cleanReturnDomain = this.extractDomain(returnPath);

    let isSpoofed = false;
    if (cleanFromDomain && cleanReturnDomain && cleanFromDomain !== cleanReturnDomain) {
      isSpoofed = true;
      anomalies.push(
        `DESALINEACIÓN DE DOMINIO: El remitente visible '${cleanFromDomain}' no coincide con el canal técnico Return-Path '${cleanReturnDomain}'.`
      );
    }

    if (spfHeaderStatus === 'FAIL') {
      anomalies.push('FALTA DE AUTENTICACIÓN SPF: La cabecera Received-SPF registra estado FAIL.');
    }

    return {
      fromAddress,
      returnPath,
      senderIp: hops.length > 0 ? hops[hops.length - 1].ip : undefined,
      spfHeaderStatus,
      dkimHeaderStatus,
      hops,
      isSpoofed,
      anomalies,
    };
  }

  private extractDomain(emailStr: string): string | null {
    const match = emailStr.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return match ? match[1].toLowerCase() : null;
  }
}