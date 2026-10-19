import { getDbPool } from '../config/database.js';
import { randomUUID } from 'crypto';
import { UNIFIED_HISTORY_QUERY } from './history/history.queries.js';
import { fetchScaHistoryRows, type ScaHistoryRow } from './history/scaHistory.service.js';

export const saveNetworkAuditRun = async (
  targetHost: string,
  riskAssessment: string,
  mitigations: Array<{ port: number; recommendation: string }>
): Promise<string> => {
  const scanId = randomUUID();
  const pool = getDbPool();

  await pool.execute(
    'INSERT INTO port_scans (id, target_host, status, ai_risk_assessment, finished_at) VALUES (?, ?, ?, ?, NOW())',
    [scanId, targetHost, 'COMPLETED', riskAssessment]
  );

  for (const m of mitigations) {
    await pool.execute(
      'INSERT INTO open_ports (id, port_scan_id, port_number, service_name, ai_mitigation) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), scanId, m.port, 'Configured Service', m.recommendation]
    );
  }

  return scanId;
};

export const fetchAllTestRuns = async (): Promise<any[]> => {
  const [rows] = await getDbPool().execute(UNIFIED_HISTORY_QUERY);
  return rows as any[];
};

export const fetchScaTestRuns = async (): Promise<ScaHistoryRow[]> => {
  return await fetchScaHistoryRows();
};

export const fetchRedTeamTestRuns = async (): Promise<any[]> => {
  const [rows] = await getDbPool().execute('SELECT * FROM redteam_history ORDER BY created_at DESC LIMIT 50');
  return rows as any[];
};