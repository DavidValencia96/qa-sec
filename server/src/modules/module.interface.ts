import { InterceptedRequest, InterceptedResponse } from '../core/interceptor.types.js';
import { SeverityLevel } from '../services/db.types.js';

export interface ModuleFinding {
  moduleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  recommendation: string;
  targetUrl?: string;
  evidence?: string;
  rawPayload?: string;
}

export interface SecurityModuleStrategy {
  readonly name: string;
  readonly description: string;
  execute(
    targetUrl: string,
    requests: unknown[],
    responses: unknown[]
  ): Promise<ModuleFinding[]>;
}