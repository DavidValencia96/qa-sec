import { chromium, Browser, BrowserContext, Page, Route, Response } from 'playwright';
import { InterceptedRequest, InterceptedResponse, MutationCallback } from './interceptor.types.js';
import { formatTargetUrl, parseRouteRequest, parseResponseData } from './interceptor/interceptor.helpers.js';

export class TrafficInterceptor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private requests: InterceptedRequest[] = [];
  private responses: InterceptedResponse[] = [];

  public async initialize(headless: boolean = true): Promise<void> {
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext({ ignoreHTTPSErrors: true });
    this.page = await this.context.newPage();
  }

  public async startCapture(mutationHandler?: MutationCallback): Promise<void> {
    if (!this.page) throw new Error('[!] Interceptor no inicializado.');

    await this.page.route('**/*', async (route: Route) => {
      const requestData = parseRouteRequest(route.request());
      this.requests.push(requestData);

      if (mutationHandler) {
        const customOverrides = await mutationHandler(requestData);
        if (customOverrides) {
          return route.continue(customOverrides);
        }
      }
      return route.continue();
    });

    this.page.on('response', async (response: Response) => {
      const responseData = await parseResponseData(response);
      this.responses.push(responseData);
    });
  }

  public async navigateTo(url: string): Promise<void> {
    if (!this.page) throw new Error('[!] Página no lista.');

    const formattedUrl = formatTargetUrl(url);

    try {
      await this.page.goto(formattedUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await this.page.waitForTimeout(3000);
    } catch (error) {
      const errMessage = (error as Error).message;
      if (errMessage.includes('Timeout') || errMessage.includes('timeout')) {
        console.warn(`[!] Advertencia: La página ${formattedUrl} tardó en cargar. Se procesará lo capturado.`);
      } else {
        throw error;
      }
    }
  }

  public getCapturedRequests(): InterceptedRequest[] {
    return this.requests;
  }

  public getCapturedResponses(): InterceptedResponse[] {
    return this.responses;
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}