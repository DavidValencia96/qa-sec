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
  // Se eliminó '--single-process' para evitar que Chromium colapse inesperadamente
  const browser = await chromium.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--disable-accelerated-2d-canvas',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  // Contexto con User-Agent de navegador estándar e ignorando errores de certificados
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  const results: AuditResult[] = [];

  try {
    // 1. Navegación con resolución rápida ('commit') para asegurar la conexión
    await page.goto(targetUrl, { waitUntil: 'commit', timeout: 30000 });

    // 2. Esperar domcontentloaded de forma tolerante a fallos
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {
      console.warn(`[!] DOM no completó carga total en 15s para ${targetUrl}, procediendo con DOM disponible.`);
    });

    // 3. Evaluar inputs encontrados
    for (const input of targetInputs) {
      results.push(await evaluateSingleInput(page, input, promptId));
    }
  } catch (error) {
    console.error(`[!] Error ejecutando auditoría de inputs sobre ${targetUrl}:`, error);
    throw error;
  } finally {
    // Cierre limpio validando el estado del navegador
    await context.close().catch(() => {});
    if (browser.isConnected()) {
      await browser.close().catch(() => {});
    }
  }

  return results;
}