export interface LoadTestConfig {
  targetUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  concurrency: number;
  durationSeconds: number;
  payloadJson?: string;
  headersJson?: string;
}

export interface StatusCodeBreakdown {
  status2xx: number;
  status4xx: number;
  status429RateLimited: number;
  status5xx: number;
  timeouts: number;
}

export interface LoadTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  requestsPerSecond: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  statusBreakdown: StatusCodeBreakdown;
}

export interface LoadTestResult {
  runId: string;
  config: LoadTestConfig;
  metrics: LoadTestMetrics;
  aiDiagnosis: {
    rateLimitingProtection: 'EXCELLENT' | 'WEAK' | 'CRITICAL_MISSING';
    summary: string;
    recommendations: string[];
  };
}