import { getDbPool } from '../../config/database.js';
import type { LoadTestMetrics, LoadTestConfigDTO } from '../../modules/loadTest/loadTest.types.js';

export const saveLoadTestAuditRecord = async (
  id: string,
  config: LoadTestConfigDTO,
  metrics: LoadTestMetrics,
  aiDiagnosisJson: string
): Promise<void> => {
  try {
    const query = `
      INSERT INTO load_test_history 
        (id, target_url, method, concurrency, duration_seconds, total_requests, rps, avg_latency_ms, p95_latency_ms, rate_limit_protection, metrics_json, ai_diagnosis_json) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await getDbPool().execute(query, [
      id,
      config.targetUrl,
      config.method,
      config.concurrency,
      config.durationSeconds,
      metrics.totalRequests,
      metrics.requestsPerSecond,
      metrics.avgLatencyMs,
      metrics.p95LatencyMs,
      metrics.statusBreakdown.status429RateLimited > 0 ? 'ACTIVE' : 'INACTIVE',
      JSON.stringify(metrics),
      aiDiagnosisJson,
    ]);
  } catch (error) {
    console.error('[!] Error guardando historial de pruebas de carga en MySQL:', (error as Error).message);
  }
};