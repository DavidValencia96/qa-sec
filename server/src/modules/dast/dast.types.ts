export interface OpenApiEndpointDefinition {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly parameters: ReadonlyArray<{
    readonly name: string;
    readonly in: 'path' | 'query' | 'header' | 'body';
    readonly required: boolean;
    readonly schemaType?: string;
  }>;
  readonly requestBodySchema?: Record<string, unknown>;
}

export interface DastAuditConfigDTO {
  readonly targetBaseUrl: string;
  readonly openApiSpecJson?: string;
  readonly primaryAuthHeader?: string;
  readonly secondaryAuthHeader?: string;
  readonly enableBolaTesting: boolean;
  readonly enableHeaderInjectionTesting: boolean;
}

export interface DastFinding {
  readonly vulnerabilityType: 'BOLA_IDOR' | 'CRLF_INJECTION' | 'HOST_HEADER_INJECTION' | 'UNAUTHORIZED_VERB';
  readonly severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  readonly endpointPath: string;
  readonly httpMethod: string;
  readonly description: string;
  readonly remediation: string;
  readonly evidencePayload: string;
}

export interface DastAuditResult {
  readonly runId: string;
  readonly totalTestedEndpoints: number;
  readonly findings: ReadonlyArray<DastFinding>;
  readonly aiSummary?: string;
}