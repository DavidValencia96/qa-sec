import type { Request, Response } from 'express';
import { LoadTestHistoryService } from '../../services/loadTest/loadTestHistory.service.js';

const historyService = new LoadTestHistoryService();

export const getLoadTestHistoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const history = await historyService.fetchHistory(limit);

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