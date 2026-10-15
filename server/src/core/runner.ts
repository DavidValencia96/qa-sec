import { chromium } from 'playwright';
import { TrafficInterceptor } from './interceptor.js';
import { calculateDuration, type TargetSelector, type AnalysisSessionResult } from './runner/runner.helpers.js';
import { evaluateSingleInput, type AuditResult } from './runner/inputAudit.evaluator.js';

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

  return { targetUrl, durationMs: calculateDuration(startTime), requests, responses };
};

export async function executeInputAuditRunner(
  targetUrl: string,
  targetInputs: TargetSelector[],
  promptId: string = '',
  headless: boolean = true
): Promise<AuditResult[]> {
  const browser = await chromium.launch({ headless });
  const page = await (await browser.newContext()).newPage();
  const results: AuditResult[] = [];

  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    for (const input of targetInputs) {
      // Transmite el promptId recuperado a la evaluación del input
      results.push(await evaluateSingleInput(page, input, promptId));
    }
  } finally {
    await browser.close();
  }

  return results;
}