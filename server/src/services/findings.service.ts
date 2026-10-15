import { getDbPool } from '../config/database.js';
import { normalizeFindingPayload, type ExtendedFindingInput } from './findings/findings.helpers.js';

function buildInsertValues(finding: ExtendedFindingInput) {
  const { targetUrlValue, evidenceValue, formattedPayload } = normalizeFindingPayload(finding);
  const findingType = finding.type || finding.module_name || 'UNKNOWN_MODULE';

  return [
    finding.id,
    finding.test_run_id,
    findingType,
    finding.severity,
    finding.title,
    finding.description,
    finding.recommendation || null,
    targetUrlValue,
    evidenceValue,
    formattedPayload,
  ];
}

export const saveFinding = async (finding: ExtendedFindingInput): Promise<void> => {
  const query = `
    INSERT INTO findings (id, test_run_id, type, severity, title, description, recommendation, target_url, evidence, raw_payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await getDbPool().execute(query, buildInsertValues(finding));
};

export const getFindingsByRunId = async (runId: string): Promise<Record<string, unknown>[]> => {
  const query = `
    SELECT 
      id,
      test_run_id AS testRunId,
      type AS moduleName,
      severity,
      title,
      description,
      recommendation,
      target_url AS targetUrl,
      evidence,
      raw_payload AS rawPayload,
      created_at AS createdAt
    FROM findings 
    WHERE test_run_id = ? 
    ORDER BY created_at DESC
  `;
  const [rows] = await getDbPool().execute(query, [runId]);
  return rows as Record<string, unknown>[];
};

export const getFullReportByRunId = async (runId: string) => {
  const query = `
    SELECT 
      f.id AS findingId,
      f.type AS moduleName,
      f.severity,
      f.title,
      f.description,
      f.recommendation,
      f.target_url AS targetUrl,
      f.evidence,
      f.raw_payload AS rawPayload,
      f.created_at AS findingTime,
      tr.id AS runId,
      tr.status AS runStatus,
      tr.started_at AS startedAt,
      tr.finished_at AS finishedAt,
      ts.name AS suiteName,
      ts.prompt_input AS promptInput,
      ts.modules_config AS modulesConfig,
      p.name AS projectName,
      p.target_url AS projectTargetUrl
    FROM findings f
    INNER JOIN test_runs tr ON f.test_run_id = tr.id
    INNER JOIN test_suites ts ON tr.test_suite_id = ts.id
    INNER JOIN projects p ON ts.project_id = p.id
    WHERE tr.id = ?
    ORDER BY f.created_at DESC
  `;

  const [rows] = await getDbPool().execute(query, [runId]);
  return rows;
};