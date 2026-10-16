import { getDbPool } from '../../config/database.js';
import type { SastAnalysisResponse } from '../../modules/sast/sast.types.js';

export const saveSastAuditRecord = async (
  id: string,
  fileName: string,
  fileType: string,
  result: SastAnalysisResponse
): Promise<void> => {
  try {
    const query = `
      INSERT INTO sast_audit_history 
        (id, file_name, file_type, health_score, total_findings, findings_json, remediated_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await getDbPool().execute(query, [
      id,
      fileName,
      fileType,
      result.score,
      result.totalFindings,
      JSON.stringify(result.findings),
      result.remediatedCode || null,
    ]);
  } catch (error) {
    console.error('[!] Error guardando historial de SAST en MySQL:', (error as Error).message);
  }
};