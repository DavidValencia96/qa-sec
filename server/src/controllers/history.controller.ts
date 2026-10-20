import type { Request, Response } from 'express';
import { fetchAllTestRuns, fetchScaTestRuns } from '../services/history.service.js';
import { formatHistoryRecords } from './history/history.helpers.js';
import { getDbPool } from '../config/database.js';

export const getTestRunsHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pool = getDbPool();

    // 1. Historial Web Unificado
    const rawHistory = await fetchAllTestRuns();
    const history = formatHistoryRecords(rawHistory);

    // 2. Historial DAST
    const [dastRows] = await pool.query(`
      SELECT 
        id,
        target_base_url AS targetBaseUrl,
        total_endpoints_tested AS totalEndpointsTested,
        findings_json AS findingsJson,
        ai_summary_json AS aiSummaryJson,
        created_at AS createdAt
      FROM dast_history
      ORDER BY created_at DESC
    `);

    // 3. Historial SCA
    const scaHistory = await fetchScaTestRuns();

    // 4. Historial EASM
    const [easmRows] = await pool.query(`
      SELECT 
        id,
        target_domain AS targetDomain,
        dns_records_json AS dnsRecordsJson,
        subdomains_json AS subdomainsJson,
        waf_tech_json AS wafTechJson,
        ssl_details_json AS sslDetailsJson,
        ai_summary_json AS aiSummaryJson,
        created_at AS createdAt
      FROM easm_history
      ORDER BY created_at DESC
    `);

    // 5. Historial Red Team
    const [redteamRows] = await pool.query(`
      SELECT 
        id,
        target_url AS targetUrl,
        jwt_token AS jwtToken,
        jwt_findings_json AS jwtFindingsJson,
        cors_findings_json AS corsFindingsJson,
        phishing_count AS phishingCount,
        ai_summary_json AS aiSummaryJson,
        created_at AS createdAt
      FROM redteam_history
      ORDER BY created_at DESC
    `);

    // 6. Historial Email Security (Módulo 9)
    const [emailsecRows] = await pool.query(`
      SELECT 
        id,
        target_domain AS targetDomain,
        target_ip AS targetIp,
        spf_json AS spfJson,
        dmarc_json AS dmarcJson,
        dkim_json AS dkimJson,
        rbl_json AS rblJson,
        headers_json AS headersJson,
        ai_summary_json AS aiSummaryJson,
        created_at AS createdAt
      FROM emailsec_history
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      history,
      dastHistory: dastRows,
      scaHistory,
      easmHistory: easmRows,
      redteamHistory: redteamRows,
    });
  } catch (error) {
    console.error('[!] Error consultando historial centralizado:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};