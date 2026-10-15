import React, { useState } from 'react';
import { analyzeNetworkConfigApi } from '../services/api.client';
import { NetworkMetrics } from './network/NetworkMetrics';
import { NetworkPortsTable, type ServiceItem } from './network/NetworkPortsTable';
import { NetworkAiDiagnosis, type MitigationRule } from './network/NetworkAiDiagnosis';

export const NetworkConfigAuditor: React.FC = () => {
  const [targetHost, setTargetHost] = useState('portquiz.net');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [analysis, setAnalysis] = useState<{
    riskAssessment: string;
    mitigations: MitigationRule[];
  } | null>(null);

  const handleRunAutomaticAudit = async () => {
    if (!targetHost.trim()) return;

    setLoading(true);
    setServices([]);
    setAnalysis(null);

    try {
      const data = await analyzeNetworkConfigApi(targetHost);

      if (data.success) {
        setServices(data.scannedPorts);
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Error durante la auditoría de red:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPortsCount = services.filter((s) => s.status === 'OPEN').length;
  const closedPortsCount = services.filter((s) => s.status === 'CLOSED').length;

  return (
    <div style={{ background: '#1e1e1e', padding: '24px', borderRadius: '8px', marginTop: '20px', color: '#fff' }}>
      <h2 style={{ marginTop: 0 }}>🛡️ Auditoría & Diagnóstico de Superficie de Red</h2>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
        Ingresa la URL o IP objetivo. El backend probará en tiempo real la conectividad TCP a los puertos más comunes (HTTP, HTTPS, SSH, MySQL, Redis, etc.) y analizará los hallazgos con Gemini AI.
      </p>

      {/* CAMPO DE INGRESO DE URL */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Host / URL Objetivo:</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={targetHost}
            onChange={(e) => setTargetHost(e.target.value)}
            placeholder="ej. https://www.URL.co o 192.168.1.10"
            style={{ flex: 1, padding: '10px', background: '#09090b', border: '1px solid #444', color: '#fff', borderRadius: '4px', outline: 'none' }}
          />
          <button
            onClick={handleRunAutomaticAudit}
            disabled={loading || !targetHost.trim()}
            style={{
              background: loading ? '#4b5563' : '#2563eb',
              color: '#fff',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '⚡ Escaneando Puertos...' : '🚀 Escanear & Analizar Puertos'}
          </button>
        </div>
      </div>

      {/* RESULTADOS VISUALES MODULARIZADOS */}
      {services.length > 0 && (
        <div>
          <NetworkMetrics total={services.length} openCount={openPortsCount} closedCount={closedPortsCount} />
          <NetworkPortsTable services={services} />
        </div>
      )}

      {/* DIAGNÓSTICO Y REGLAS GENERADAS POR GEMINI AI */}
      {analysis && <NetworkAiDiagnosis targetHost={targetHost} analysis={analysis} />}
    </div>
  );
};