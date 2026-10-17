export interface LoadTestConfigDTO {
  targetUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  concurrency: number; // Ej. 10, 25, 50, 100 peticiones simultáneas
  durationSeconds: number; // Ej. 5 a 30 segundos
  headers?: Record<string, string>;
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

export interface LoadTestResultResponse {
  success: boolean;
  runId: string;
  config: LoadTestConfigDTO;
  metrics: LoadTestMetrics;
  aiDiagnosis?: {
    rateLimitingProtection: 'EXCELLENT' | 'WEAK' | 'CRITICAL_MISSING';
    summary: string;
    recommendations: string[];
  };
  error?: string;
}