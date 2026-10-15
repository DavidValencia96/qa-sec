import { TrafficInterceptor } from './interceptor.js';
import { calculateDuration, type AnalysisSessionResult } from './runner/runner.helpers.js';

export type { AnalysisSessionResult };

export const runAnalysisSession = async (
  targetUrl: string,
  headless: boolean = true
): Promise<AnalysisSessionResult> => {
  const startTime = Date.now();
  const interceptor = new TrafficInterceptor();

  await interceptor.initialize(headless);
  await interceptor.startCapture();
  await interceptor.navigateTo(targetUrl);

  const requests = interceptor.getCapturedRequests();
  const responses = interceptor.getCapturedResponses();

  await interceptor.close();

  return {
    targetUrl,
    durationMs: calculateDuration(startTime),
    requests,
    responses,
  };
};