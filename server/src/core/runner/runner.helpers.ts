import { InterceptedRequest, InterceptedResponse } from '../interceptor.types.js';

export interface AnalysisSessionResult {
  targetUrl: string;
  durationMs: number;
  requests: InterceptedRequest[];
  responses: InterceptedResponse[];
}

export const calculateDuration = (startTime: number): number => {
  return Date.now() - startTime;
};