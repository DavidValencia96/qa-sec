import type { TargetInput } from '../components/dashboard/dashboard.types';
import type { LoadTestConfig, LoadTestResult, LoadTestMetrics } from '../components/loadTest/loadTest.types';
import type { ConsolidatedReportOptions } from '../components/report/ConsolidatedReportExportModal';
export type DependencyManifestType = 'package_json' | 'requirements_txt' | 'pom_xml';

const BASE_URL = 'http://localhost:3000/api';

export const createProjectApi = async (name: string, targetUrl: string, description?: string) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, targetUrl, description }),
  });
  return res.json();
};

export const generateSuiteAIApi = async (projectId: string, userPrompt: string, promptId?: string) => {
  const res = await fetch(`${BASE_URL}/suites/generate-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, userPrompt, promptId }),
  });
  return res.json();
};

export const runTestApi = async (
  suiteId: string,
  targetUrl: string,
  targetInputs?: TargetInput[],
  promptId?: string
) => {
  const res = await fetch(`${BASE_URL}/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suiteId, targetUrl, targetInputs, promptId }),
  });
  return res.json();
};

export const getReportApi = async (runId: string) => {
  const res = await fetch(`${BASE_URL}/reports/${runId}`);
  return res.json();
};

export const getHistoryApi = async () => {
  const response = await fetch(`${BASE_URL}/history`);
  return await response.json();
};

export const analyzeNetworkConfigApi = async (targetHost: string) => {
  const response = await fetch(`${BASE_URL}/network/analyze-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetHost }),
  });
  return await response.json();
};

export const getPromptPresetsApi = async () => {
  const response = await fetch(`${BASE_URL}/prompts/presets`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: No se pudieron obtener las plantillas generales.`);
  }
  return await response.json();
};

export async function getPromptsApi() {
  const response = await fetch(`${BASE_URL}/prompts`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: No se pudo obtener la lista de prompts de inputs.`);
  }
  return await response.json();
}

export const getLatestThreatsApi = async (
  keyword?: string,
  limit: number = 40,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (keyword) params.append('keyword', keyword);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const res = await fetch(`${BASE_URL}/threats/latest?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Error obteniendo vulnerabilidades.`);
  return res.json();
};

export const analyzeCveWithAiApi = async (cveData: {
  cveId: string;
  severity: string;
  cvssScore: number;
  description: string;
  targetStack?: string;
}) => {
  const res = await fetch(`${BASE_URL}/threats/analyze-cve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cveData),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Error al analizar CVE con IA.`);
  return res.json();
};

export const analyzeSastContentApi = async (payload: {
  codeOrContent: string;
  fileName?: string;
  fileType?: 'code' | 'env' | 'package_json';
  language?: string;
}) => {
  const res = await fetch(`${BASE_URL}/sast/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Error al realizar el análisis estático.`);
  }

  return res.json();
};

export const exportReportApi = async (payload: {
  title: string;
  targetUrl?: string;
  summary: string;
  score?: number;
  findings: Array<{
    title: string;
    severity: string;
    description: string;
    recommendation?: string;
    evidence?: string;
  }>;
  remediatedCode?: string;
  format: 'html' | 'markdown';
}): Promise<void> => {
  const res = await fetch(`${BASE_URL}/reports/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Error al exportar el reporte.`);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  const contentDisposition = res.headers.get('content-disposition');
  let fileName = `reporte_seguridad.${payload.format === 'html' ? 'html' : 'md'}`;

  if (contentDisposition && contentDisposition.includes('filename=')) {
    fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
  }

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export interface SastHistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  healthScore: number;
  totalFindings: number;
  findings: Array<{
    title: string;
    severity: string;
    description: string;
    recommendation?: string;
    evidence?: string;
  }>;
  remediatedCode?: string;
  createdAt: string;
}

export const fetchSastHistoryApi = async (): Promise<SastHistoryItem[]> => {
  const res = await fetch(`${BASE_URL}/sast/history`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Error al obtener el historial SAST.`);
  }
  const data = await res.json();
  return data.data || [];
};

export const runLoadTestApi = async (payload: LoadTestConfig): Promise<LoadTestResult> => {
  const res = await fetch(`${BASE_URL}/load-test/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Error al ejecutar la prueba de carga.`);
  }

  return res.json();
};

export interface LoadTestHistoryItem {
  id: string;
  targetUrl: string;
  method: string;
  concurrency: number;
  durationSeconds: number;
  payloadJson?: string;
  headersJson?: string;
  totalRequests: number;
  rps: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  rateLimitProtection: string;
  metrics: LoadTestMetrics;
  aiDiagnosis: {
    rateLimitingProtection: 'EXCELLENT' | 'WEAK' | 'CRITICAL_MISSING';
    summary: string;
    recommendations: string[];
  };
  createdAt: string;
}

export const fetchLoadTestHistoryApi = async (): Promise<LoadTestHistoryItem[]> => {
  const res = await fetch(`${BASE_URL}/load-test/history`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Error al obtener el historial de pruebas de carga.`);
  }
  const data = await res.json();
  return data.data || [];
};

export const exportConsolidatedReportApi = async (options: ConsolidatedReportOptions): Promise<void> => {
  const payload = {
    title: `Informe Consolidado - ${options.projectName}`,
    projectName: options.projectName,
    targetUrl: options.targetUrl,
    includedModules: options.includedModules,
    format: options.format,
    webFindings: [
      {
        title: 'Vulnerabilidad Inyección SQL Simulada',
        severity: 'HIGH',
        description: 'Se detectó falta de saneamiento en parámetros de entrada.',
        recommendation: 'Usar sentencias preparadas en las consultas SQL.',
      },
    ],
    networkData: {
      targetHost: options.targetUrl || 'localhost',
      openPorts: [
        { port: 80, service: 'HTTP' },
        { port: 443, service: 'HTTPS' },
      ],
      riskAssessment: 'Superficie de red con exposición estándar de puertos web.',
    },
    sastData: {
      fileName: 'src/config/database.ts',
      healthScore: 85,
      findings: [],
    },
    loadTestData: {
      targetUrl: options.targetUrl || 'http://localhost',
      rps: 900,
      avgLatencyMs: 11,
      metrics: {
        totalRequests: 4506,
        successfulRequests: 0,
        failedRequests: 4506,
        requestsPerSecond: 900,
        avgLatencyMs: 11,
        minLatencyMs: 2,
        maxLatencyMs: 45,
        p95LatencyMs: 22,
        statusBreakdown: {
          status2xx: 0,
          status4xx: 4506,
          status429RateLimited: 0,
          status5xx: 0,
          timeouts: 0,
        },
      },
    },
  };

  const res = await fetch(`${BASE_URL}/reports/consolidated/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Error al exportar el informe consolidado.`);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  const contentDisposition = res.headers.get('content-disposition');
  let fileName = `informe_consolidado_${options.projectName.toLowerCase().replace(/\s+/g, '_')}.${options.format === 'html' ? 'html' : 'md'}`;

  if (contentDisposition && contentDisposition.includes('filename=')) {
    fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
  }

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const exportSingleRecordApi = async (payload: {
  moduleType: 'web' | 'sast' | 'load-test' | 'dast' | 'sca' | 'easm' | 'redteam';
  recordData: unknown;
  format?: 'html' | 'markdown';
}): Promise<void> => {
  const res = await fetch(`${BASE_URL}/reports/single/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Error al exportar el registro individual.`);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  const contentDisposition = res.headers.get('content-disposition');
  let fileName = `reporte_${payload.moduleType}_${Date.now()}.${payload.format === 'markdown' ? 'md' : 'html'}`;

  if (contentDisposition && contentDisposition.includes('filename=')) {
    fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
  }

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export interface DastFindingItem {
  vulnerabilityType: 'BOLA_IDOR' | 'CRLF_INJECTION' | 'HOST_HEADER_INJECTION' | 'UNAUTHORIZED_VERB';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  endpointPath: string;
  httpMethod: string;
  description: string;
  remediation: string;
  evidencePayload: string;
}

export interface DastAuditResponse {
  success: boolean;
  runId: string;
  totalTestedEndpoints: number;
  findings: DastFindingItem[];
  aiSummary?: {
    summary: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  };
  error?: string;
}

export const runDastAuditApi = async (data: {
  targetBaseUrl: string;
  openApiSpecJson?: string;
  primaryAuthHeader?: string;
  secondaryAuthHeader?: string;
  enableBolaTesting: boolean;
  enableHeaderInjectionTesting: boolean;
}): Promise<DastAuditResponse> => {
  const response = await fetch(`${BASE_URL}/dast/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export interface ScaVulnerabilityItem {
  packageName: string;
  currentVersion: string;
  cveId?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  patchedVersion?: string;
  isLicenseIncompatible: boolean;
}

export interface GitSecretFindingItem {
  commitHash: string;
  author: string;
  date: string;
  filePath: string;
  secretType: 'API_KEY' | 'PRIVATE_KEY' | 'DATABASE_URL' | 'TOKEN';
  matchedPattern: string;
  severity: 'CRITICAL' | 'HIGH';
}

export interface ScaAuditResponse {
  success: boolean;
  runId: string;
  totalDependenciesAudited: number;
  vulnerabilities: ScaVulnerabilityItem[];
  gitSecrets: GitSecretFindingItem[];
  aiSummary?: {
    summary: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  };
  error?: string;
}

export const runScaAuditApi = async (data: {
  manifestType?: DependencyManifestType;
  manifestContent: string;
  enableDependencyScan: boolean;
  enableGitHistoryScan: boolean;
}): Promise<ScaAuditResponse> => {
  const response = await fetch(`${BASE_URL}/sca/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export interface EasmAuditPayload {
  targetDomain: string;
  enableSubdomainDiscovery: boolean;
  enableWafTechDetection: boolean;
  enableSslAudit: boolean;
}

export const runEasmAuditApi = async (payload: EasmAuditPayload) => {
  const response = await fetch(`${BASE_URL}/easm/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al ejecutar la auditoría EASM.');
  }
  return response.json();
};

export interface RedTeamAuditPayload {
  targetUrl: string;
  jwtToken?: string;
  publicKeyPem?: string;
  enableJwtScanner: boolean;
  enableCorsExploiter: boolean;
  enablePhishingSimulator: boolean;
  phishingTargetEmails?: string[];
}

export const runRedTeamAuditApi = async (payload: RedTeamAuditPayload) => {
  const response = await fetch(`${BASE_URL}/redteam/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al ejecutar la auditoría de Red Team.');
  }

  return response.json();
};