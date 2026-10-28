// server/src/services/history.service.ts

import { getDbPool } from '../config/database.js';
import { randomUUID } from 'crypto';
import { getUnifiedHistoryQuery } from './history/history.queries.js';
import { fetchScaHistoryRows, type ScaHistoryRow } from './history/scaHistory.service.js';
import type { AuthenticatedRequest } from '../modules/auth/auth.types.js';

export const saveNetworkAuditRun = async (
  targetHost: string,
  riskAssessment: string,
  mitigations: Array<{ port: number; recommendation: string }>,
  testerEmail: string = 'visitante'
): Promise<string> => {
  const scanId = randomUUID();
  const pool = getDbPool();

  await pool.execute(
    'INSERT INTO port_scans (id, target_host, tester_email, status, ai_risk_assessment, finished_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [scanId, targetHost, testerEmail, 'COMPLETED', riskAssessment]
  );

  for (const m of mitigations) {
    await pool.execute(
      'INSERT INTO open_ports (id, port_scan_id, port_number, service_name, ai_mitigation) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), scanId, m.port, 'Configured Service', m.recommendation]
    );
  }

  return scanId;
};

export const fetchAllTestRuns = async (req?: AuthenticatedRequest): Promise<any[]> => {
  const pool = getDbPool();
  const { query, queryParams } = getUnifiedHistoryQuery((req || {}) as AuthenticatedRequest);
  const [rows] = await pool.query(query, queryParams);
  return rows as any[];
};

export const fetchScaTestRuns = async (
  sqlClause: string = '',
  params: string[] = []
): Promise<ScaHistoryRow[]> => {
  return await fetchScaHistoryRows(sqlClause, params);
};

export const fetchRedTeamTestRuns = async (): Promise<any[]> => {
  const [rows] = await getDbPool().execute('SELECT * FROM redteam_history ORDER BY created_at DESC LIMIT 50');
  return rows as any[];
};