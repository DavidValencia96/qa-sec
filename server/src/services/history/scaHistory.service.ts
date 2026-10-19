import { getDbPool } from '../../config/database.js';

export interface ScaHistoryRow {
  id: string;
  manifestType: string;
  totalDepsAudited: number;
  vulnerabilitiesJson: string | null;
  gitSecretsJson: string | null;
  aiSummaryJson: string | null;
  createdAt: string;
}

export const fetchScaHistoryRows = async (): Promise<ScaHistoryRow[]> => {
  const pool = getDbPool();
  const query = `
    SELECT 
      id,
      manifest_type AS manifestType,
      total_deps_audited AS totalDepsAudited,
      vulnerabilities_json AS vulnerabilitiesJson,
      git_secrets_json AS gitSecretsJson,
      ai_summary_json AS aiSummaryJson,
      created_at AS createdAt
    FROM sca_history
    ORDER BY created_at DESC
  `;

  const [rows] = await pool.query(query);
  return rows as ScaHistoryRow[];
};