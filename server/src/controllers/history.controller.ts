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

    res.status(200).json({
      success: true,
      history,
      dastHistory: dastRows,
      scaHistory,
    });
  } catch (error) {
    console.error('[!] Error consultando historial centralizado:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};