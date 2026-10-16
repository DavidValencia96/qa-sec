import { CveItem, CveSeverity } from '../../modules/cve/cve.types.js';

export const parseNistSeverity = (metrics: Record<string, any>): { severity: CveSeverity; score: number } => {
  const cvssData =
    metrics?.cvssMetricV31?.[0]?.cvssData ||
    metrics?.cvssMetricV30?.[0]?.cvssData ||
    metrics?.cvssMetricV2?.[0]?.cvssData;

  if (!cvssData) return { severity: 'UNKNOWN', score: 0 };

  const baseSeverity = cvssData.baseSeverity?.toUpperCase() as CveSeverity;
  return {
    severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(baseSeverity) ? baseSeverity : 'UNKNOWN',
    score: cvssData.baseScore || 0,
  };
};

export const formatNistCveItem = (vulnerability: any): CveItem => {
  const cve = vulnerability.cve;
  const metrics = parseNistSeverity(cve.metrics || {});
  const englishDesc = cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'Sin descripción disponible.';

  return {
    id: cve.id,
    publishedAt: cve.published,
    updatedAt: cve.lastModified,
    description: englishDesc,
    severity: metrics.severity,
    cvssScore: metrics.score,
    referenceUrl: cve.references?.[0]?.url || `https://nvd.nist.gov/vuln/detail/${cve.id}`,
  };
};

export const buildNistQueryUrl = (
  keyword?: string,
  limit: number = 40,
  startDate?: string,
  endDate?: string
): string => {
  const baseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
  const queryParams = new URLSearchParams({
    resultsPerPage: String(limit),
  });

  const MAX_DAYS_NVD = 120;
  let startMs: number;
  let endMs: number;

  if (startDate && endDate) {
    startMs = new Date(`${startDate}T00:00:00.000Z`).getTime();
    endMs = new Date(`${endDate}T23:59:59.999Z`).getTime();

    // La API de NVD exige máximo 120 días de diferencia entre fechas
    const diffDays = (endMs - startMs) / (1000 * 60 * 60 * 24);
    if (diffDays > MAX_DAYS_NVD) {
      startMs = endMs - MAX_DAYS_NVD * 24 * 60 * 60 * 1000;
    }
  } else {
    endMs = new Date().getTime();
    startMs = endMs - MAX_DAYS_NVD * 24 * 60 * 60 * 1000;
  }

  const formattedStart = new Date(startMs).toISOString().replace('Z', '');
  const formattedEnd = new Date(endMs).toISOString().replace('Z', '');

  if (keyword && keyword.trim()) {
    queryParams.append('keywordSearch', keyword.trim());
  }

  // Usar estrictamente los parámetros de fecha de publicación (pubStartDate/pubEndDate)
  queryParams.append('pubStartDate', formattedStart);
  queryParams.append('pubEndDate', formattedEnd);

  return `${baseUrl}?${queryParams.toString()}`;
};