import { InterceptedRequest, InterceptedResponse } from '../interceptor.types.js';
import { Page, Locator } from 'playwright';

export interface AnalysisSessionResult {
  targetUrl: string;
  durationMs: number;
  requests: InterceptedRequest[];
  responses: InterceptedResponse[];
}

export const calculateDuration = (startTime: number): number => {
  return Date.now() - startTime;
};

export interface TargetSelector {
  type: 'id' | 'name' | 'xpath' | 'css';
  value: string;
}

/**
 * Mapea el tipo de selector proporcionado por el usuario a un localizador de Playwright
 */
export function buildPlaywrightLocator(page: Page, target: TargetSelector): Locator {
  const cleanValue = target.value.trim();

  switch (target.type) {
    case 'id':
      return page.locator(`#${cleanValue.replace(/^#/, '')}`);
    case 'name':
      return page.locator(`[name="${cleanValue}"]`);
    case 'xpath':
      return page.locator(`xpath=${cleanValue}`);
    case 'css':
      return page.locator(cleanValue);
    default:
      throw new Error(`Tipo de localizador no soportado: ${target.type}`);
  }
}