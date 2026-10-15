export const UNIFIED_HISTORY_QUERY = `
  SELECT 
    tr.id AS runId,
    'WEB_AUDIT' AS auditType,
    tr.status AS status,
    tr.started_at AS startedAt,
    tr.finished_at AS finishedAt,
    ts.name AS suiteName,
    ts.prompt_input AS promptInput,
    COALESCE(p.name, 'Proyecto QA Test') AS projectName,
    p.target_url AS targetUrl,
    COUNT(f.id) AS totalFindings
  FROM test_runs tr
  LEFT JOIN test_suites ts ON tr.test_suite_id = ts.id
  LEFT JOIN projects p ON ts.project_id = p.id
  LEFT JOIN findings f ON f.test_run_id = tr.id
  GROUP BY tr.id, tr.status, tr.started_at, tr.finished_at, ts.name, ts.prompt_input, p.name, p.target_url

  UNION ALL

  SELECT 
    ps.id AS runId,
    'NETWORK_AUDIT' AS auditType,
    ps.status AS status,
    ps.started_at AS startedAt,
    ps.finished_at AS finishedAt,
    'Auditoría de Configuración de Red' AS suiteName,
    NULL AS promptInput,
    'Infraestructura' AS projectName,
    ps.target_host AS targetUrl,
    (SELECT COUNT(*) FROM open_ports op WHERE op.port_scan_id = ps.id) AS totalFindings
  FROM port_scans ps

  ORDER BY startedAt DESC
`;