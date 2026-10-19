import type { Request, Response } from 'express';
import { getDbPool } from '../../config/database.js';
import { generateId } from '../../utils/id.generator.js';
import { OpenApiParserService } from '../../services/dast/openApiParser.service.js';
import { BolaScannerService } from '../../services/dast/bolaScanner.service.js';
import { HeaderInjectionScannerService } from '../../services/dast/headerInjectionScanner.service.js';
import { GeminiAIService } from '../../services/gemini.service.js';
import type { DastAuditConfigDTO, DastFinding } from '../../modules/dast/dast.types.js';

const openApiParser = new OpenApiParserService();
const bolaScanner = new BolaScannerService();
const headerScanner = new HeaderInjectionScannerService();
const geminiService = new GeminiAIService();

export const runDastAuditHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = req.body as DastAuditConfigDTO;

    if (!config.targetBaseUrl) {
      res.status(400).json({ success: false, error: 'targetBaseUrl es requerida para el análisis DAST.' });
      return;
    }

    const runId = generateId('dast');
    const findings: DastFinding[] = [];

    // 1. Fuzzing de endpoints OpenAPI / Swagger si se adjuntó especificación JSON
    let endpointsCount = 0;
    if (config.openApiSpecJson) {
      const endpoints = openApiParser.parseSpecification(config.openApiSpecJson);
      endpointsCount = endpoints.length;

      if (config.enableBolaTesting && config.primaryAuthHeader && config.secondaryAuthHeader) {
        for (const endpoint of endpoints) {
          const bolaFinding = await bolaScanner.auditEndpointForBola(
            config.targetBaseUrl,
            endpoint,
            config.primaryAuthHeader,
            config.secondaryAuthHeader
          );
          if (bolaFinding) findings.push(bolaFinding);
        }
      }
    }

    // 2. Fuzzing de inyección de encabezados HTTP
    if (config.enableHeaderInjectionTesting) {
      const headerFindings = await headerScanner.auditHeaderInjections(config.targetBaseUrl);
      findings.push(...headerFindings);
    }

    // 3. Diagnóstico con Gemini AI
    const aiSummary = await geminiService.analyzeDastResultsWithAi(
      config.targetBaseUrl,
      endpointsCount,
      findings
    );

    // 4. Persistencia en MySQL
    const insertQuery = `
      INSERT INTO dast_history (id, target_base_url, total_endpoints_tested, findings_json, ai_summary_json)
      VALUES (?, ?, ?, ?, ?)
    `;
    await getDbPool().execute(insertQuery, [
      runId,
      config.targetBaseUrl,
      endpointsCount,
      JSON.stringify(findings),
      JSON.stringify(aiSummary),
    ]);

    res.status(200).json({
      success: true,
      runId,
      totalTestedEndpoints: endpointsCount,
      findings,
      aiSummary,
    });
  } catch (error) {
    console.error('[!] Error en runDastAuditHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};