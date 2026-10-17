import type { Request, Response } from 'express';
import { SastHistoryService } from '../../services/sast/sastHistory.service.js';

const sastHistoryService = new SastHistoryService();

export const getSastHistoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const history = await sastHistoryService.fetchSastAuditHistory(limit);

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

export const getSastHistoryItemHandler = async (req: Request, res: Response): Promise<void> => {
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