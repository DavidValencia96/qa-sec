import { getDbPool } from '../../config/database.js';
import { CveAiAnalysisResult } from '../../services/gemini/cveAnalysis.types.js';

export const getCachedCveAnalysis = async (cveId: string): Promise<CveAiAnalysisResult | null> => {
  const pool = getDbPool();
  const [rows]: any = await pool.query(
    'SELECT summary_es, impact_level, mitigation_steps, urgency FROM cve_ai_cache WHERE cve_id = ?',
    [cveId]
  );

  if (!rows || rows.length === 0) return null;

  const record = rows[0];
  return {
    summaryEs: record.summary_es,
    impactLevel: record.impact_level,
    mitigationSteps: typeof record.mitigation_steps === 'string' ? JSON.parse(record.mitigation_steps) : record.mitigation_steps,
    urgency: record.urgency,
  };
};

export const saveCveAnalysisCache = async (cveId: string, result: CveAiAnalysisResult): Promise<void> => {
  const pool = getDbPool();
  const query = `
    INSERT INTO cve_ai_cache (cve_id, summary_es, impact_level, mitigation_steps, urgency)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE summary_es=VALUES(summary_es), impact_level=VALUES(impact_level), mitigation_steps=VALUES(mitigation_steps), urgency=VALUES(urgency)
  `;
  await pool.execute(query, [
    cveId,
    result.summaryEs,
    result.impactLevel,
    JSON.stringify(result.mitigationSteps),
    result.urgency,
  ]);
};