import type { Response } from 'express';
import { LoadTestHistoryService } from '../../services/loadTest/loadTestHistory.service.js';
import type { AuthenticatedRequest } from '../../modules/auth/auth.types.js';
import { buildTesterFilterClause } from '../../modules/auth/auth.helpers.js';

const historyService = new LoadTestHistoryService();

export const getLoadTestHistoryHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const { sqlClause, params } = buildTesterFilterClause(req);

    const history = await historyService.fetchHistory(limit, sqlClause, params);

    res.status(200).json({
      success: true,
      total: history.length,
      data: history,
    });
  } catch (error) {
    console.error('[!] Error en getLoadTestHistoryHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};