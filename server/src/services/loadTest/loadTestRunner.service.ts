import type { LoadTestConfigDTO, LoadTestMetrics, StatusCodeBreakdown } from '../../modules/loadTest/loadTest.types.js';

export class LoadTestRunnerService {
  public async executeLoadTest(config: LoadTestConfigDTO): Promise<LoadTestMetrics> {
    const latencies: number[] = [];
    const statusBreakdown: StatusCodeBreakdown = {
      status2xx: 0,
      status4xx: 0,
      status429RateLimited: 0,
      status5xx: 0,
      timeouts: 0,
    };

    // 1. Preparar Cabeceras HTTP por defecto y personalizadas
    const requestHeaders: Record<string, string> = {
      'User-Agent': 'QA-Sec-Suite-LoadTester/1.0',
    };

    if (config.payloadJson && config.method !== 'GET') {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Integrar cabeceras provistas como objeto si existen
    if (config.headers) {
      Object.assign(requestHeaders, config.headers);
    }

    // Parsear e integrar cabeceras recibidas como string JSON (headersJson)
    if (config.headersJson && config.headersJson.trim().length > 0) {
      try {
        const parsedCustomHeaders = JSON.parse(config.headersJson);
        if (typeof parsedCustomHeaders === 'object' && parsedCustomHeaders !== null) {
          Object.assign(requestHeaders, parsedCustomHeaders);
        }
      } catch {
        console.warn('⚠️ [LoadTestRunner] No se pudieron parsear las cabeceras personalizadas en headersJson. Continuando con cabeceras por defecto.');
      }
    }

    const startTime = Date.now();
    const endTime = startTime + config.durationSeconds * 1000;

    const worker = async () => {
      while (Date.now() < endTime) {
        const reqStart = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout por petición

          const res = await fetch(config.targetUrl, {
            method: config.method,
            headers: requestHeaders,
            body: config.method !== 'GET' ? config.payloadJson : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          const reqDuration = Date.now() - reqStart;
          latencies.push(reqDuration);

          if (res.status === 429) {
            statusBreakdown.status429RateLimited++;
          } else if (res.status >= 200 && res.status < 300) {
            statusBreakdown.status2xx++;
          } else if (res.status >= 400 && res.status < 500) {
            statusBreakdown.status4xx++;
          } else if (res.status >= 500) {
            statusBreakdown.status5xx++;
          }
        } catch {
          statusBreakdown.timeouts++;
          latencies.push(5000);
        }
      }
    };

    // Lanzar trabajadores paralelos según la concurrencia solicitada
    const workers = Array.from({ length: config.concurrency }, () => worker());
    await Promise.all(workers);

    const totalDurationSeconds = Math.max((Date.now() - startTime) / 1000, 1);
    const totalRequests = latencies.length;

    latencies.sort((a, b) => a - b);
    const sumLatency = latencies.reduce((acc, curr) => acc + curr, 0);
    const avgLatencyMs = totalRequests > 0 ? Math.round(sumLatency / totalRequests) : 0;
    const minLatencyMs = latencies.length > 0 ? latencies[0] : 0;
    const maxLatencyMs = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95LatencyMs = latencies.length > 0 ? latencies[p95Index] || maxLatencyMs : 0;

    return {
      totalRequests,
      successfulRequests: statusBreakdown.status2xx,
      failedRequests: statusBreakdown.status5xx + statusBreakdown.timeouts,
      requestsPerSecond: Math.round(totalRequests / totalDurationSeconds),
      avgLatencyMs,
      minLatencyMs,
      maxLatencyMs,
      p95LatencyMs,
      statusBreakdown,
    };
  }
}