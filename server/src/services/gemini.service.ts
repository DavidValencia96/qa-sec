import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import type { GeneratedSuiteConfig, SummaryFindingInput, DefensivenessSummary } from './gemini.types.js';
import {
  DEFAULT_SUITE_CONFIG,
  DEFAULT_EXECUTIVE_SUMMARY,
  SYSTEM_PROMPT_SUITE_GENERATION,
  getExecutiveSummaryPrompt,
  getEnrichFindingsPrompt,
  getNetworkConfigPrompt,
} from './gemini/gemini.prompts.js';
import { buildFormAuditPrompt, FormAuditAiInput } from './gemini/formAudit.prompt.js';
import { buildCveAnalysisPrompt, CveAnalysisInput } from './gemini/cveAnalysis.prompt.js';
import type { CveAiAnalysisResult } from './gemini/cveAnalysis.types.js';
import { buildSastAnalysisPrompt, SastAiInput } from './gemini/sastAnalysis.prompt.js';
import type { SastFinding } from '../modules/sast/sast.types.js';
import { generateId } from '../utils/id.generator.js';
import type { LoadTestConfigDTO, LoadTestMetrics } from '../modules/loadTest/loadTest.types.js';
import { buildLoadTestAnalysisPrompt } from './gemini/loadTestAnalysis.prompt.js';
import type { ConsolidatedReportInputDTO, ConsolidatedExecutiveSummary } from '../modules/report/consolidatedReport.types.js';
import { buildConsolidatedReportPrompt } from './gemini/consolidatedReport.prompt.js';
import { buildDastAnalysisPrompt } from './gemini/dastAnalysis.prompt.js';
import type { DastFinding } from '../modules/dast/dast.types.js';
import { buildEasmAnalysisPrompt } from './gemini/easmAnalysis.prompt.js';
import type { JwtFinding, CorsFinding } from '../modules/redteam/redteam.types.js';
import { buildRedTeamAnalysisPrompt } from './gemini/redTeamAnalysis.prompt.js';

export interface DastAiAnalysisResult {
  summary: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
}

export interface EasmAiAnalysisResult {
  summary: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
}

export interface RedTeamAiAnalysisResult {
  summary: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
}

export interface EmailSecAiAnalysisResult {
  summary: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
}

export class GeminiAIService {
  private ai: GoogleGenAI;
  // Modelos ordenados por velocidad de respuesta y disponibilidad activa
  private fallbackModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }

  private async executeWithFallback(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    let lastError: unknown = null;

    for (const modelName of this.fallbackModels) {
      try {
        const fetchPromise = this.ai.models.generateContent({
          model: modelName,
          contents: systemPrompt ? [systemPrompt, userPrompt] : [userPrompt],
          config: {
            maxOutputTokens: maxTokens,
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });

        // Timeout ágil de 12s para saltar rápidamente si un modelo se congela
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT: Tiempo de espera agotado (12s)')), 12000)
        );

        const response = await Promise.race([fetchPromise, timeoutPromise]);
        const text = response.text || '';

        console.log(`✅ [Gemini AI] HTTP 200 OK - Respuesta obtenida exitosamente usando el modelo: ${modelName}`);
        return text;
      } catch (error: unknown) {
        lastError = error;
        const errObj = error as { status?: string; code?: string; message?: string };
        const status = errObj?.status || errObj?.code || 'ERROR';
        const message = errObj?.message || String(error);
        console.warn(`⚠️ [Gemini AI] HTTP ${status} en modelo ${modelName}: ${message}. Reintentando con modelo de respaldo...`);
      }
    }

    throw lastError || new Error('Todos los modelos de respaldo de Gemini fallaron.');
  }

  public async evaluateFormResponseWithAi(input: FormAuditAiInput): Promise<{
    resilienceStatus: string;
    technicalAnalysis: string;
    recommendedAction: string;
  }> {
    const defaultResponse = {
      resilienceStatus: input.httpStatus >= 500 ? 'RISK_DETECTED' : 'SECURE',
      technicalAnalysis: `El servidor respondió con código HTTP ${input.httpStatus}.`,
      recommendedAction: 'Garantizar consultas parametrizadas (Prepared Statements) y validación de entradas.',
    };

    try {
      console.log(`🤖 [Gemini AI] Evaluando respuesta transaccional del formulario...`);
      const prompt = buildFormAuditPrompt(input);
      const text = await this.executeWithFallback('', prompt, 500);
      return this.parseJsonResponse(text, defaultResponse);
    } catch {
      console.warn('⚠️ [Gemini AI] Error evaluando respuesta del formulario con IA. Usando dictamen por defecto.');
      return defaultResponse;
    }
  }

  public async generateSuiteFromPrompt(promptText: string): Promise<GeneratedSuiteConfig> {
    try {
      console.log('🤖 [Gemini AI] Enviando prompt para generación de suite...');
      const text = await this.executeWithFallback(SYSTEM_PROMPT_SUITE_GENERATION, promptText, 400);
      return this.parseJsonResponse<GeneratedSuiteConfig>(text, DEFAULT_SUITE_CONFIG);
    } catch {
      console.warn('❌ [Gemini AI] No se pudo generar la suite con ningún modelo. Aplicando configuración de respaldo por defecto.');
      return DEFAULT_SUITE_CONFIG;
    }
  }

  public async generateExecutiveSummary(findings: SummaryFindingInput[]): Promise<DefensivenessSummary> {
    if (!findings || findings.length === 0) {
      console.log('ℹ️ [Gemini AI] No hay hallazgos para analizar.');
      return {
        executiveSummary: 'No se detectaron hallazgos de seguridad durante esta ejecución.',
        remediationPriority: ['Mantener las configuraciones de seguridad actuales.'],
      };
    }

    try {
      console.log(`🤖 [Gemini AI] Enviando ${findings.length} hallazgo(s) para resumen ejecutivo...`);
      const prompt = getExecutiveSummaryPrompt(findings);
      const text = await this.executeWithFallback('', prompt, 500);
      return this.parseJsonResponse<DefensivenessSummary>(text, DEFAULT_EXECUTIVE_SUMMARY);
    } catch {
      console.warn('❌ [Gemini AI] No se pudo generar el resumen ejecutivo con ningún modelo. Usando resumen por defecto.');
      return DEFAULT_EXECUTIVE_SUMMARY;
    }
  }

  public async enrichFindingsWithAiRecommendations(findings: any[]): Promise<any[]> {
    if (!findings || findings.length === 0) return findings;

    const mappedFindings = findings.map((f) => ({
      id: f.id || f.findingId,
      title: f.title,
      severity: f.severity,
      description: f.description,
      evidence: f.evidence?.substring(0, 300),
    }));

    try {
      const prompt = getEnrichFindingsPrompt(mappedFindings);
      const text = await this.executeWithFallback('', prompt, 800);
      const parsed = this.parseJsonResponse<{ mitigations: Array<{ id: string; recommendation: string }> }>(text, { mitigations: [] });

      return findings.map((finding) => {
        const aiMitigation = parsed.mitigations.find((m) => m.id === (finding.id || finding.findingId));
        return {
          ...finding,
          recommendation: aiMitigation?.recommendation || finding.recommendation,
        };
      });
    } catch {
      console.warn('⚠️ [Gemini AI] No se pudieron enriquecer las recomendaciones. Usando recomendaciones base del módulo.');
      return findings;
    }
  }

  public async analyzeNetworkConfigurationWithAi(
    targetHost: string,
    openServices: Array<{ port: number; service: string }>
  ): Promise<{
    riskAssessment: string;
    mitigations: Array<{ port: number; recommendation: string }>;
  }> {
    if (!openServices || openServices.length === 0) {
      return {
        riskAssessment: `🟢 Perímetro de Red Seguro: La auditoría en tiempo real no detectó puertos ni servicios TCP abiertos/expuestos públicamente en "${targetHost}". La superficie de exposición de red se encuentra minimizada.`,
        mitigations: [
          {
            port: 0,
            recommendation: 'Políticas de Firewall: Mantener activas las reglas de denegación por defecto (DEFAULT DROP) en UFW/Iptables para tráfico entrante no autorizado.',
          },
          {
            port: 0,
            recommendation: 'Monitoreo Preventivo: Configurar un sistema de detección de intrusos (IDS/Fail2ban) para registrar e inspeccionar intentos de escaneo de puertos persistentes.',
          },
        ],
      };
    }

    try {
      console.log(`🤖 [Gemini AI] Evaluando configuración defensiva de red para ${targetHost}...`);
      const prompt = getNetworkConfigPrompt(targetHost, openServices);
      const text = await this.executeWithFallback('', prompt, 700);
      return this.parseJsonResponse(text, {
        riskAssessment: `Análisis defensivo completado para ${targetHost}.`,
        mitigations: [],
      });
    } catch {
      console.warn('⚠️ [Gemini AI] Error analizando configuración de red. Retornando respuesta de respaldo.');
      return {
        riskAssessment: `Se identificaron ${openServices.length} puerto(s) abierto(s) en ${targetHost}, pero la IA no pudo procesar la recomendación detallada.`,
        mitigations: openServices.map((s) => ({
          port: s.port,
          recommendation: `Restringir el acceso al servicio ${s.service} (Puerto ${s.port}) utilizando reglas de firewall o VPN.`,
        })),
      };
    }
  }

  public async analyzeCveWithAi(input: CveAnalysisInput): Promise<CveAiAnalysisResult> {
    const fallback = this.getFallbackCveAnalysis(input);
    try {
      console.log(`🤖 [Gemini AI] Analizando vulnerabilidad ${input.cveId}...`);
      const prompt = buildCveAnalysisPrompt(input);
      const text = await this.executeWithFallback('', prompt, 700);

      const parsed = this.parseJsonResponse<any>(text, null);
      if (!parsed) return fallback;

      return {
        summaryEs: parsed.summaryEs || parsed.summary_es || parsed.summary || fallback.summaryEs,
        impactLevel: parsed.impactLevel || parsed.impact_level || parsed.impact || fallback.impactLevel,
        mitigationSteps: parsed.mitigationSteps || parsed.mitigation_steps || parsed.mitigations || fallback.mitigationSteps,
        urgency: parsed.urgency || fallback.urgency,
      };
    } catch (error) {
      console.error(`[!] Error al analizar ${input.cveId} con Gemini AI:`, (error as Error).message);
      return fallback;
    }
  }

  public async analyzeCodeWithAi(input: SastAiInput): Promise<{
    score: number;
    findings: SastFinding[];
    remediatedCode: string;
  }> {
    const fallback = {
      score: 70,
      findings: [],
      remediatedCode: input.codeOrContent,
    };

    try {
      console.log('🤖 [Gemini AI] Ejecutando análisis estático de código (SAST)...');
      const prompt = buildSastAnalysisPrompt(input);
      const text = await this.executeWithFallback('', prompt, 1200);

      const parsed = this.parseJsonResponse<any>(text, null);
      if (!parsed) return fallback;

      const aiFindings: SastFinding[] = (parsed.findings || []).map((f: any) => ({
        id: generateId('sast'),
        type: 'CODE_VULNERABILITY',
        severity: f.severity || 'MEDIUM',
        ruleId: 'SAST-AI-RULE',
        title: f.title || 'Vulnerabilidad Detectada',
        description: f.description || 'Hallazgo identificado mediante IA.',
        lineNumber: f.lineNumber || undefined,
        recommendation: f.recommendation || 'Revisar y aplicar corrección defensiva.',
      }));

      return {
        score: typeof parsed.healthScore === 'number' ? parsed.healthScore : 80,
        findings: aiFindings,
        remediatedCode: parsed.remediatedCode || input.codeOrContent,
      };
    } catch (error) {
      console.error('[!] Error en analyzeCodeWithAi:', (error as Error).message);
      return fallback;
    }
  }

  public async analyzeLoadTestWithAi(
    config: LoadTestConfigDTO,
    metrics: LoadTestMetrics
  ): Promise<{
    rateLimitingProtection: 'EXCELLENT' | 'WEAK' | 'CRITICAL_MISSING';
    summary: string;
    recommendations: string[];
  }> {
    const fallback = {
      rateLimitingProtection: (metrics.statusBreakdown.status429RateLimited > 0 ? 'EXCELLENT' : 'WEAK') as 'EXCELLENT' | 'WEAK' | 'CRITICAL_MISSING',
      summary: 'Prueba de carga completada. No se pudo obtener el diagnóstico detallado de la IA.',
      recommendations: ['Configurar un middleware de Rate Limiting como express-rate-limit en la API.'],
    };

    try {
      console.log(`🤖 [Gemini AI] Analizando resultados de prueba de estrés para ${config.targetUrl}...`);
      const prompt = buildLoadTestAnalysisPrompt(config, metrics);
      const text = await this.executeWithFallback('', prompt, 800);

      const parsed = this.parseJsonResponse<any>(text, null);
      if (!parsed) return fallback;

      return {
        rateLimitingProtection: parsed.rateLimitingProtection || fallback.rateLimitingProtection,
        summary: parsed.summary || fallback.summary,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallback.recommendations,
      };
    } catch (error) {
      console.error('[!] Error en analyzeLoadTestWithAi:', (error as Error).message);
      return fallback;
    }
  }

  public async generateConsolidatedExecutiveSummary(
    data: ConsolidatedReportInputDTO
  ): Promise<ConsolidatedExecutiveSummary> {
    const fallback: ConsolidatedExecutiveSummary = {
      overallRiskLevel: 'MEDIUM',
      globalHealthScore: 75,
      executiveOverview: 'Reporte consolidado generado exitosamente. No se pudo obtener la evaluación detallada de la IA.',
      priorityRemediations: ['Revisar los hallazgos individuales reportados en cada módulo de auditoría.'],
    };

    try {
      console.log(`🤖 [Gemini AI] Generando Resumen Ejecutivo Consolidado para el proyecto: ${data.projectName}...`);
      const prompt = buildConsolidatedReportPrompt(data);
      const text = await this.executeWithFallback('', prompt, 900);

      const parsed = this.parseJsonResponse<any>(text, null);
      if (!parsed) return fallback;

      return {
        overallRiskLevel: parsed.overallRiskLevel || fallback.overallRiskLevel,
        globalHealthScore: typeof parsed.globalHealthScore === 'number' ? parsed.globalHealthScore : fallback.globalHealthScore,
        executiveOverview: parsed.executiveOverview || fallback.executiveOverview,
        priorityRemediations: Array.isArray(parsed.priorityRemediations) ? parsed.priorityRemediations : fallback.priorityRemediations,
      };
    } catch (error) {
      console.error('[!] Error en generateConsolidatedExecutiveSummary:', (error as Error).message);
      return fallback;
    }
  }

  public async analyzeDastResultsWithAi(
    targetBaseUrl: string,
    totalTestedEndpoints: number,
    findings: ReadonlyArray<DastFinding>
  ): Promise<DastAiAnalysisResult> {
    const fallback: DastAiAnalysisResult = {
      summary: 'Auditoría DAST realizada. Se identificaron puntos de evaluación dinámica en la API.',
      riskLevel: findings.some((f) => f.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
      recommendations: [
        'Implementar validación estricta de autorización a nivel de objeto (BOLA/IDOR).',
        'Sanitizar encabezados HTTP y configurar una lista blanca de Hosts en el Proxy/WAF.',
      ],
    };

    try {
      console.log(`🤖 [Gemini AI] Analizando resultados DAST para ${targetBaseUrl}...`);
      const prompt = buildDastAnalysisPrompt(targetBaseUrl, totalTestedEndpoints, findings);
      const text = await this.executeWithFallback('', prompt, 800);

      const parsed = this.parseJsonResponse<any>(text, null);
      if (!parsed) return fallback;

      return {
        summary: parsed.summary || fallback.summary,
        riskLevel: parsed.riskLevel || fallback.riskLevel,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallback.recommendations,
      };
    } catch (error) {
      console.error('[!] Error en analyzeDastResultsWithAi:', (error as Error).message);
      return fallback;
    }
  }

  public async generateEasmSummary(easmData: any): Promise<EasmAiAnalysisResult> {
    const fallback: EasmAiAnalysisResult = {
      summary: `Superficie externa analizada para ${easmData.cleanDomain || 'el objetivo'}. Se identificaron ${easmData.subdomains?.length || 0} subdominios activos y ${easmData.dnsRecords?.length || 0} registros DNS.`,
      riskLevel: easmData.sslDetails?.valid ? 'LOW' : 'MEDIUM',
      recommendations: [
        'Garantizar que todas las comunicaciones HTTPS utilicen protocolos modernos (TLS 1.2+).',
        'Configurar registros SPF, DKIM y DMARC en la zona DNS para prevenir suplantación de correo.',
        'Restringir acceso a subdominios de entornos de desarrollo/staging.',
      ],
    };

    try {
      console.log(`🤖 [Gemini AI] Evaluando superficie de ataque externa (EASM) para ${easmData.cleanDomain}...`);
      const prompt = buildEasmAnalysisPrompt(easmData);
      const text = await this.executeWithFallback('', prompt, 800);

      const parsed = this.parseJsonResponse<EasmAiAnalysisResult>(text, null as any);
      if (!parsed) return fallback;

      return {
        summary: parsed.summary || fallback.summary,
        riskLevel: parsed.riskLevel || fallback.riskLevel,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallback.recommendations,
      };
    } catch (error) {
      console.error('[!] Error en generateEasmSummary:', (error as Error).message);
      return fallback;
    }
  }

  public async analyzeRedTeamFindings(
    targetUrl: string,
    jwtFindings: JwtFinding[],
    corsFindings: CorsFinding[],
    phishingCount: number
  ): Promise<RedTeamAiAnalysisResult> {
    const fallback: RedTeamAiAnalysisResult = {
      summary: 'Análisis de Red Team completado.',
      riskLevel: jwtFindings.length > 0 || corsFindings.length > 0 ? 'HIGH' : 'LOW',
      recommendations: ['Revisar la configuración de firmas JWT y políticas CORS.'],
    };

    try {
      console.log(`🤖 [Gemini AI] Analizando hallazgos de Red Team para ${targetUrl}...`);
      const prompt = buildRedTeamAnalysisPrompt(targetUrl, jwtFindings, corsFindings, phishingCount);
      const text = await this.executeWithFallback('', prompt, 800);

      const parsed = this.parseJsonResponse<RedTeamAiAnalysisResult>(text, null as any);
      if (!parsed) return fallback;

      return {
        summary: parsed.summary || fallback.summary,
        riskLevel: parsed.riskLevel || fallback.riskLevel,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallback.recommendations,
      };
    } catch (error) {
      console.error('[!] Error en analyzeRedTeamFindings:', (error as Error).message);
      return fallback;
    }
  }

  public async analyzeEmailSecFindings(
    domain: string,
    spf?: any,
    dmarc?: any,
    rbl?: any,
    headerAnalysis?: any
  ): Promise<EmailSecAiAnalysisResult> {
    const fallback: EmailSecAiAnalysisResult = {
      summary: `Auditoría de seguridad de correo realizada para el dominio/entorno "${domain}".`,
      riskLevel: dmarc?.policy === 'MISSING' || spf?.policy === 'ALLOW_ALL' ? 'HIGH' : 'MEDIUM',
      recommendations: [
        'Configurar una política DMARC estricta (p=quarantine o p=reject).',
        'Asegurar un registro SPF restrictivo terminado en -all o ~all.',
      ],
    };

    try {
      console.log(`🤖 [Gemini AI] Analizando Email Security & OSINT para ${domain}...`);
      const userPrompt = `
Eres un experto auditor de ciberseguridad especializado en Email Security & Anti-Phishing (OSINT).
Analiza los siguientes hallazgos técnicos recopilados para el objetivo: "${domain}".

=== RESULTADOS SPF ===
${JSON.stringify(spf || 'No evaluado', null, 2)}

=== RESULTADOS DMARC ===
${JSON.stringify(dmarc || 'No evaluado', null, 2)}

=== REPUTACIÓN RBL / LISTAS NEGRAS ===
${JSON.stringify(rbl || 'No evaluado', null, 2)}

=== ANÁLISIS DE ENCABEZADOS Y SPOOFING ===
${JSON.stringify(headerAnalysis || 'No evaluado', null, 2)}

Responde estrictamente con un JSON en este formato exacto:
{
  "summary": "Resumen ejecutivo en español detallando los riesgos y vulnerabilidades de suplantación.",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "recommendations": ["Recomendación 1", "Recomendación 2"]
}
`;

      const text = await this.executeWithFallback('', userPrompt, 800);
      const parsed = this.parseJsonResponse<EmailSecAiAnalysisResult>(text, null as any);
      if (!parsed) return fallback;

      return {
        summary: parsed.summary || fallback.summary,
        riskLevel: parsed.riskLevel || fallback.riskLevel,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallback.recommendations,
      };
    } catch (error) {
      console.error('[!] Error en analyzeEmailSecFindings:', (error as Error).message);
      return fallback;
    }
  }

  private getFallbackCveAnalysis(input: CveAnalysisInput): CveAiAnalysisResult {
    return {
      summaryEs: `Vulnerabilidad ${input.cveId} con severidad ${input.severity}. Descripción original: ${input.description}`,
      impactLevel: 'No se pudo generar la evaluación detallada con IA. Se sugiere revisión manual.',
      mitigationSteps: ['Verificar la versión del paquete o componente afectado y actualizar a la última versión parcheada.'],
      urgency: (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(input.severity) ? input.severity : 'MEDIUM') as any,
    };
  }

  private parseJsonResponse<T>(text: string, defaultValue: T): T {
    try {
      const cleanedText = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (!match) return defaultValue;

      return JSON.parse(match[0]) as T;
    } catch {
      return defaultValue;
    }
  }
}