import type { Response } from 'express';
import { SastHistoryService } from '../../services/sast/sastHistory.service.js';
import type { AuthenticatedRequest } from '../../modules/auth/auth.types.js';
import { buildTesterFilterClause } from '../../modules/auth/auth.helpers.js';

const sastHistoryService = new SastHistoryService();

export const getSastHistoryHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const { sqlClause, params } = buildTesterFilterClause(req);

    const history = await sastHistoryService.fetchSastAuditHistory(limit, sqlClause, params);

    res.status(200).json({
      success: true,
      total: history.length,
      data: history,
    });
  } catch (error) {
    console.error('[!] Error en getSastHistoryHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getSastHistoryItemHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'El ID de auditoría es requerido.' });
      return;
    }

    const item = await sastHistoryService.fetchSastAuditById(id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Auditoría SAST no encontrada.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('[!] Error en getSastHistoryItemHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};