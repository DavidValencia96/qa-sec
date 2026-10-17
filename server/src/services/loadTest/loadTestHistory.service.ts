import { getDbPool } from '../../config/database.js';
import type { LoadTestMetrics } from '../../modules/loadTest/loadTest.types.js';

export interface LoadTestHistoryItem {
  id: string;
  targetUrl: string;
  method: string;
  concurrency: number;
  durationSeconds: number;
  totalRequests: number;
  rps: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  rateLimitProtection: string;
  metrics: LoadTestMetrics;
  aiDiagnosis: {
    rateLimitingProtection: 'EXCELLENT' | 'WEAK' | 'CRITICAL_MISSING';
    summary: string;
    recommendations: string[];
  };
  createdAt: string;
}

export class LoadTestHistoryService {
  public async fetchHistory(limit: number = 20): Promise<LoadTestHistoryItem[]> {
    try {
      const query = `
        SELECT 
          id, 
          target_url AS targetUrl, 
          method, 
          concurrency, 
          duration_seconds AS durationSeconds, 
          total_requests AS totalRequests, 
          rps, 
          avg_latency_ms AS avgLatencyMs, 
          p95_latency_ms AS p95LatencyMs, 
          rate_limit_protection AS rateLimitProtection, 
          metrics_json AS metricsJson, 
          ai_diagnosis_json AS aiDiagnosisJson, 
          created_at AS createdAt
        FROM load_test_history
        ORDER BY created_at DESC
        LIMIT ?
      `;

      const [rows] = await getDbPool().query(query, [limit]);
      const items = rows as any[];

      return items.map((row) => ({
        id: row.id,
        targetUrl: row.targetUrl,
        method: row.method,
        concurrency: row.concurrency,
        durationSeconds: row.durationSeconds,
        totalRequests: row.totalRequests,
        rps: row.rps,
        avgLatencyMs: row.avgLatencyMs,
        p95LatencyMs: row.p95LatencyMs,
        rateLimitProtection: row.rateLimitProtection,
        metrics: this.safeParseJson<LoadTestMetrics>(row.metricsJson, {} as LoadTestMetrics),
        aiDiagnosis: this.safeParseJson(row.aiDiagnosisJson, {
          rateLimitingProtection: 'WEAK',
          summary: '',
          recommendations: [],
        }),
        createdAt: new Date(row.createdAt).toISOString(),
      }));
    } catch (error) {
      console.error('[!] Error en LoadTestHistoryService.fetchHistory:', (error as Error).message);
      return [];
    }
  }

  private safeParseJson<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return defaultValue;
    }
  }
}