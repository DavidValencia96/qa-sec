import type { Request, Response } from 'express';
import { DnsAuthScannerService } from '../../services/emailsec/dnsAuthScanner.service.js';
import { RblScannerService } from '../../services/emailsec/rblScanner.service.js';
import { HeaderParserService } from '../../services/emailsec/headerParser.service.js';
import { GeminiAIService } from '../../services/gemini.service.js';
import { getDbPool } from '../../config/database.js';
import { generateUniqueId } from '../../utils/id.generator.js';
import type { EmailSecAuditPayload, EmailSecAuditResponse } from '../../modules/emailsec/emailsec.types.js';

const dnsScanner = new DnsAuthScannerService();
const rblScanner = new RblScannerService();
const headerParser = new HeaderParserService();
const geminiService = new GeminiAIService();

export const runEmailSecAuditHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as EmailSecAuditPayload;
    const runId = generateUniqueId();

    let spfResult;
    let dmarcResult;
    let dkimResult;
    let rblResult;
    let headerResult;

    if (payload.domain) {
      spfResult = await dnsScanner.auditSpf(payload.domain);
      dmarcResult = await dnsScanner.auditDmarc(payload.domain);
      dkimResult = await dnsScanner.auditDkim(payload.domain, payload.dkimSelector || 'google');
    }

    if (payload.targetIp) {
      rblResult = await rblScanner.checkIpReputation(payload.targetIp);
    }

    if (payload.rawHeaders) {
      headerResult = headerParser.parseRawHeaders(payload.rawHeaders);
      if (headerResult.senderIp && !rblResult) {
        rblResult = await rblScanner.checkIpReputation(headerResult.senderIp);
      }
    }

    const aiSummary = await geminiService.analyzeEmailSecFindings(
      payload.domain || 'N/A',
      spfResult,
      dmarcResult,
      rblResult,
      headerResult
    );

    // Guardar en la base de datos
    const pool = getDbPool();
    await pool.query(
      `INSERT INTO emailsec_history (id, target_domain, target_ip, spf_json, dmarc_json, dkim_json, rbl_json, headers_json, ai_summary_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        runId,
        payload.domain || null,
        payload.targetIp || null,
        spfResult ? JSON.stringify(spfResult) : null,
        dmarcResult ? JSON.stringify(dmarcResult) : null,
        dkimResult ? JSON.stringify(dkimResult) : null,
        rblResult ? JSON.stringify(rblResult) : null,
        headerResult ? JSON.stringify(headerResult) : null,
        JSON.stringify(aiSummary),
      ]
    );

    const response: EmailSecAuditResponse = {
      success: true,
      runId,
      domain: payload.domain,
      spf: spfResult,
      dmarc: dmarcResult,
      dkim: dkimResult,
      rbl: rblResult,
      headerAnalysis: headerResult,
      aiSummary,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('[!] Error en runEmailSecAuditHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};