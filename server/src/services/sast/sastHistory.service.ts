import { getDbPool } from '../../config/database.js';
import type { SastAnalysisResponse, SastFinding } from '../../modules/sast/sast.types.js';

export interface SastAuditHistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  healthScore: number;
  totalFindings: number;
  findings: SastFinding[];
  remediatedCode?: string;
  createdAt: string;
}

export class SastHistoryService {
  public async fetchSastAuditHistory(limit: number = 20): Promise<SastAuditHistoryItem[]> {
    try {
      const query = `
        SELECT 
          id, 
          file_name AS fileName, 
          file_type AS fileType, 
          health_score AS healthScore, 
          total_findings AS totalFindings, 
          findings_json AS findingsJson, 
          remediated_code AS remediatedCode, 
          created_at AS createdAt 
        FROM sast_audit_history 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      const [rows] = await getDbPool().query(query, [limit]);
      const items = rows as any[];

      return items.map((row) => ({
        id: row.id,
        fileName: row.fileName,
        fileType: row.fileType,
        healthScore: row.healthScore,
        totalFindings: row.totalFindings,
        findings: this.safeParseJson<SastFinding[]>(row.findingsJson, []),
        remediatedCode: row.remediatedCode || undefined,
        createdAt: new Date(row.createdAt).toISOString(),
      }));
    } catch (error) {
      console.error('[!] Error en SastHistoryService.fetchSastAuditHistory:', (error as Error).message);
      return [];
    }
  }

  public async fetchSastAuditById(id: string): Promise<SastAuditHistoryItem | null> {
    try {
      const query = `
        SELECT 
          id, 
          file_name AS fileName, 
          file_type AS fileType, 
          health_score AS healthScore, 
          total_findings AS totalFindings, 
          findings_json AS findingsJson, 
          remediated_code AS remediatedCode, 
          created_at AS createdAt 
        FROM sast_audit_history 
        WHERE id = ? 
        LIMIT 1
      `;

      const [rows] = await getDbPool().query(query, [id]);
      const items = rows as any[];

      if (items.length === 0) return null;

      const row = items[0];
      return {
        id: row.id,
        fileName: row.fileName,
        fileType: row.fileType,
        healthScore: row.healthScore,
        totalFindings: row.totalFindings,
        findings: this.safeParseJson<SastFinding[]>(row.findingsJson, []),
        remediatedCode: row.remediatedCode || undefined,
        createdAt: new Date(row.createdAt).toISOString(),
      };
    } catch (error) {
      console.error('[!] Error en SastHistoryService.fetchSastAuditById:', (error as Error).message);
      return null;
    }
  }

  private safeParseJson<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return defaultValue;
    }
  }
}