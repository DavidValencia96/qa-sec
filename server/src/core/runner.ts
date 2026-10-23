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
  const browser = await chromium.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ],
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  const results: AuditResult[] = [];

  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    for (const input of targetInputs) {
      results.push(await evaluateSingleInput(page, input, promptId));
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  return results;
}