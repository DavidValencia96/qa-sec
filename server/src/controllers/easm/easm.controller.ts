import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getDbPool } from '../../config/database.js';
import { EasmScannerService } from '../../services/easm/easmScanner.service.js';
import { GeminiAIService } from '../../services/gemini.service.js';
import type { EasmAuditDTO, EasmAuditResult } from '../../modules/easm/easm.types.js';

const easmScanner = new EasmScannerService();
const geminiService = new GeminiAIService();

export const runEasmAuditHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      targetDomain,
      enableSubdomainDiscovery = true,
      enableWafTechDetection = true,
      enableSslAudit = true,
    } = req.body as EasmAuditDTO;

    if (!targetDomain) {
      res.status(400).json({
        success: false,
        error: 'El dominio objetivo (targetDomain) es requerido.',
      });
      return;
    }

    const cleanDomain = targetDomain.trim().toLowerCase().replace(/^https?:\/\//i, '').split('/')[0];

    // 1. Ejecutar escaneos en paralelo
    const [dnsRecords, subdomains, wafAndTech, sslDetails] = await Promise.all([
      easmScanner.resolveDnsRecords(cleanDomain),
      enableSubdomainDiscovery ? easmScanner.discoverSubdomains(cleanDomain) : Promise.resolve([]),
      enableWafTechDetection
        ? easmScanner.detectWafAndTech(cleanDomain)
        : Promise.resolve({ wafDetected: false, serverHeader: 'N/A', detectedTechStack: [] }),
      enableSslAudit
        ? easmScanner.auditSslCertificate(cleanDomain)
        : Promise.resolve({ valid: false, weakProtocolsDetected: [] }),
    ]);

    // 2. Diagnóstico IA sintético con Gemini
    const rawEasmData = { cleanDomain, dnsRecords, subdomains, wafAndTech, sslDetails };
    const aiSummary = await geminiService.generateEasmSummary(rawEasmData);

    const runId = randomUUID();
    const result: EasmAuditResult = {
      runId,
      targetDomain: cleanDomain,
      dnsRecords,
      subdomains,
      wafAndTech,
      sslDetails,
      aiSummary,
    };

    // 3. Persistir auditoría en MySQL
    const pool = getDbPool();
    await pool.query(
      `INSERT INTO easm_history 
        (id, target_domain, dns_records_json, subdomains_json, waf_tech_json, ssl_details_json, ai_summary_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        runId,
        cleanDomain,
        JSON.stringify(dnsRecords),
        JSON.stringify(subdomains),
        JSON.stringify(wafAndTech),
        JSON.stringify(sslDetails),
        JSON.stringify(aiSummary),
      ]
    );

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[!] Error en runEasmAuditHandler:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};