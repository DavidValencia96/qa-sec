import { Request, Response } from 'express';
import { scanTargetPortsReal } from '../services/portScanner.service.js';
import { GeminiAIService } from '../services/gemini.service.js';
import { saveNetworkAuditRun } from '../services/history.service.js';
import { validateTargetHost, filterOpenPorts } from './portScan/portScan.helpers.js';

const geminiService = new GeminiAIService();

export const handleAnalyzeNetworkConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const host = validateTargetHost(req.body?.targetHost);

    if (!host) {
      res.status(400).json({ success: false, error: 'Se requiere una URL o Host válido.' });
      return;
    }

    // 1. Escaneo real de puertos TCP en el servidor
    const scannedPorts = await scanTargetPortsReal(host);

    // 2. Filtrar puertos abiertos para la IA
    const openPorts = filterOpenPorts(scannedPorts);

    // 3. Consultar a Gemini AI sobre los hallazgos
    const analysis = await geminiService.analyzeNetworkConfigurationWithAi(host, openPorts);

    // 4. Guardar resultado en MySQL
    const scanId = await saveNetworkAuditRun(host, analysis.riskAssessment, analysis.mitigations);

    res.status(200).json({
      success: true,
      scanId,
      scannedPorts,
      analysis,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};