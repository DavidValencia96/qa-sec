import { Request, Response } from 'express';
import { fetchAllTestRuns } from '../services/history.service.js';
import { formatHistoryRecords } from './history/history.helpers.js';

export const getTestRunsHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rawHistory = await fetchAllTestRuns();
    const history = formatHistoryRecords(rawHistory);

    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};