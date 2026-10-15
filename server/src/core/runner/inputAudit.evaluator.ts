import { Page } from 'playwright';
import { type TargetSelector } from './runner.helpers.js';
import { discoverFormStructure } from './form.discovery.js';
import { executeFormTransaction, type FormExecutionResult } from './form.evaluator.js';
import { GeminiAIService } from '../../services/gemini.service.js';
import { getPayloadsByPromptId } from '../../services/inputPayloads.service.js';

const geminiService = new GeminiAIService();

export interface AuditResult {
  selector: string;
  type: string;
  testType: string;
  payloadUsed: string;
  httpStatus: number;
  status: 'RESILIENT' | 'SUSPICIOUS_ERROR' | 'NOT_FOUND';
  detail: string;
}

function buildNotFoundResult(input: TargetSelector): AuditResult {
  return {
    selector: input.value,
    type: input.type || 'xpath',
    testType: 'Localización',
    payloadUsed: 'N/A',
    httpStatus: 0,
    status: 'NOT_FOUND',
    detail: 'El localizador no se encontró en el DOM.',
  };
}

async function mapTransactionWithAi(
  pageUrl: string,
  res: FormExecutionResult,
  payloadUsed: string,
  testType: string
): Promise<AuditResult> {
  const isError = res.httpStatus >= 500;
  const aiDiagnosis = await geminiService.evaluateFormResponseWithAi({
    targetUrl: pageUrl,
    selector: res.selector,
    httpStatus: res.httpStatus,
    responseSnippet: res.responseBody,
  });

  return {
    selector: res.selector,
    type: res.type,
    testType,
    payloadUsed,
    httpStatus: res.httpStatus,
    status: isError ? 'SUSPICIOUS_ERROR' : 'RESILIENT',
    detail: `${res.detail} | IA Diagnosis: ${aiDiagnosis.technicalAnalysis}`,
  };
}

export async function evaluateSingleInput(page: Page, input: TargetSelector, promptId: string = ''): Promise<AuditResult> {
  const contextMap = await discoverFormStructure(page, input);
  if ((await contextMap.targetLocator.count()) === 0) {
    return buildNotFoundResult(input);
  }

  // Al establecer promptId: string = '' en el parámetro de la función,
  // TypeScript garantiza que nunca será undefined al llamar a getPayloadsByPromptId.
  const payloads = await getPayloadsByPromptId(promptId);
  const selectedPayload = payloads.length > 0 ? payloads[0].payload_value : "test_qa'";

  const targetDTO = {
    value: input.value,
    type: input.type ? input.type : 'xpath',
  };

  const result = await executeFormTransaction(page, contextMap, targetDTO);
  return await mapTransactionWithAi(page.url(), result, selectedPayload, 'Evaluación Transaccional de Formulario');
}