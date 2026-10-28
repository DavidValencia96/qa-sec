import type { AuthenticatedRequest } from '../../modules/auth/auth.types.js';

export const getUnifiedHistoryQuery = (req: AuthenticatedRequest) => {
  const role = req.user?.role;
  const email = req.user?.email ? req.user.email.trim().toLowerCase() : null;

  let trWhere = '';
  let psWhere = '';
  let params: string[] = [];

  // ADMIN y AUDITOR: Visualización global sin filtros
  if (role === 'ADMIN' || role === 'AUDITOR') {
    trWhere = '';
    psWhere = '';
    params = [];
  } 
  // VIEWER autenticado: Únicamente sus propias ejecuciones
  else if (role === 'VIEWER' && email) {
    trWhere = 'WHERE LOWER(tr.tester_email) = ?';
    psWhere = 'WHERE LOWER(ps.tester_email) = ?';
    params = [email, email];
  } 
  // Visitante o anónimo: Únicamente ejecuciones públicas
  else {
    trWhere = "WHERE tr.tester_email = 'visitante'";
    psWhere = "WHERE ps.tester_email = 'visitante'";
    params = [];
  }

  const query = `
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
      COUNT(f.id) AS totalFindings,
      tr.tester_email AS testerEmail
    FROM test_runs tr
    LEFT JOIN test_suites ts ON tr.test_suite_id = ts.id
    LEFT JOIN projects p ON ts.project_id = p.id
    LEFT JOIN findings f ON f.test_run_id = tr.id
    ${trWhere}
    GROUP BY tr.id, tr.status, tr.started_at, tr.finished_at, ts.name, ts.prompt_input, p.name, p.target_url, tr.tester_email

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
      (SELECT COUNT(*) FROM open_ports op WHERE op.port_scan_id = ps.id) AS totalFindings,
      ps.tester_email AS testerEmail
    FROM port_scans ps
    ${psWhere}

    ORDER BY startedAt DESC
  `;

  return {
    query,
    queryParams: params,
  };
};