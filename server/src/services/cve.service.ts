import type { CveFeedResponse, CveFilterDTO, CveItem } from '../modules/cve/cve.types.js';
import { REQUEST_TIMEOUT_MS } from '../modules/cve/cve.constants.js';
import { buildNistQueryUrl, formatNistCveItem } from './cve/cve.helpers.js';

export class CveService {
  async fetchLatestVulnerabilities(filter: CveFilterDTO = {}): Promise<CveFeedResponse> {
    const limit = filter.limit || 40;
    const targetUrl = buildNistQueryUrl(filter.keyword, limit, filter.startDate, filter.endDate);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      console.log(`[+] Consultando NVD NIST Radar URL: ${targetUrl}`);
      const response = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al consultar servicio NVD NIST.`);
      }

      const data: any = await response.json();
      const rawVulnerabilities = data.vulnerabilities || [];

      // 1. Mapear vulnerabilidades
      const mappedItems: CveItem[] = rawVulnerabilities.map(formatNistCveItem);

      // 2. Filtrado estricto EXCLUSIVAMENTE sobre la fecha de publicación (publishedAt)
      let filteredItems = mappedItems;

      if (filter.startDate || filter.endDate) {
        const startMs = filter.startDate ? new Date(`${filter.startDate}T00:00:00Z`).getTime() : 0;
        const endMs = filter.endDate ? new Date(`${filter.endDate}T23:59:59Z`).getTime() : Number.MAX_SAFE_INTEGER;

        filteredItems = filteredItems.filter((item) => {
          const pubMs = new Date(item.publishedAt).getTime();
          // Condición estricta: la fecha de publicación debe estar dentro del rango
          return pubMs >= startMs && pubMs <= endMs;
        });
      }

      // 3. Ordenamiento descendente por fecha de publicación
      const sortedItems = filteredItems.sort(
        (a: CveItem, b: CveItem) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      return {
        success: true,
        totalResults: sortedItems.length,
        vulnerabilities: sortedItems,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[!] Error en CveService.fetchLatestVulnerabilities:', (error as Error).message);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): CveFeedResponse {
    return {
      success: false,
      totalResults: 0,
      vulnerabilities: [],
      fetchedAt: new Date().toISOString(),
    };
  }
}