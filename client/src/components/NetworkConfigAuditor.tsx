import React, { useState } from 'react';
import { analyzeNetworkConfigApi } from '../services/api.client';
import { NetworkMetrics } from './network/NetworkMetrics';
import { NetworkPortsTable, type ServiceItem } from './network/NetworkPortsTable';
import { NetworkAiDiagnosis, type MitigationRule } from './network/NetworkAiDiagnosis';

export interface NetworkModuleData {
  targetHost: string;
  services: ServiceItem[];
  analysis: {
    riskAssessment: string;
    mitigations: MitigationRule[];
  } | null;
}

interface NetworkConfigAuditorProps {
  networkData?: NetworkModuleData;
  onUpdateNetworkData?: (data: Partial<NetworkModuleData>) => void;
}

export const NetworkConfigAuditor: React.FC<NetworkConfigAuditorProps> = ({
  networkData,
  onUpdateNetworkData,
}) => {
  const [targetHost, setTargetHost] = useState(networkData?.targetHost || 'portquiz.net');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(networkData?.services || []);
  const [analysis, setAnalysis] = useState<{
    riskAssessment: string;
    mitigations: MitigationRule[];
  } | null>(networkData?.analysis || null);

  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetHost(val);
    if (onUpdateNetworkData) {
      onUpdateNetworkData({ targetHost: val });
    }
  };

  const handleRunAutomaticAudit = async () => {
    if (!targetHost.trim() || loading) return;

    setLoading(true);
    setServices([]);
    setAnalysis(null);

    try {
      const data = await analyzeNetworkConfigApi(targetHost);

      if (data && data.success) {
        const fetchedServices = data.scannedPorts || [];
        const fetchedAnalysis = data.analysis || null;

        setServices(fetchedServices);
        setAnalysis(fetchedAnalysis);

        // Guardar en la memoria global por módulo (App.tsx)
        if (onUpdateNetworkData) {
          onUpdateNetworkData({
            targetHost,
            services: fetchedServices,
            analysis: fetchedAnalysis,
          });
        }
      } else {
        alert(`Error durante la auditoría: ${data?.error || 'Sin respuesta'}`);
      }
    } catch (err) {
      console.error('Error durante la auditoría de red:', err);
      alert('Error de conexión con el servidor de análisis de red.');
    } finally {
      setLoading(false);
    }
  };

  const openPortsCount = services.filter((s) => s.status === 'OPEN').length;
  const closedPortsCount = services.filter((s) => s.status === 'CLOSED').length;

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(10px)',
        padding: '28px',
        borderRadius: '12px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        marginBottom: '28px',
      }}
    >
      {/* CABECERA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            🛡️ Auditoría & Diagnóstico de Superficie de Red
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Ingresa la URL o IP objetivo. El backend probará en tiempo real la conectividad TCP a los puertos más comunes (HTTP, HTTPS, SSH, MySQL, Redis, etc.) y analizará los hallazgos con Gemini AI.
          </p>
        </div>

        <span
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid #38bdf8',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          Infrastructure Security
        </span>
      </div>

      {/* CAMPO DE INGRESO DE URL */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
          🌐 Host / URL Objetivo:
        </label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={targetHost}
            onChange={handleHostChange}
            disabled={loading}
            placeholder="ej. https://www.google.com/ o 192.168.1.10"
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '12px 16px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'monospace',
            }}
          />
          <button
            type="button"
            onClick={handleRunAutomaticAudit}
            disabled={loading || !targetHost.trim()}
            style={{
              padding: '12px 24px',
              background: loading
                ? 'rgba(51, 65, 85, 0.6)'
                : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: loading ? '1px solid #475569' : '1px solid #38bdf8',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              cursor: loading || !targetHost.trim() ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 15px rgba(56, 189, 248, 0.35)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚡</span>
                <span>Escaneando Puertos...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Escanear & Analizar Puertos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RESULTADOS VISUALES MODULARIZADOS */}
      {services.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <NetworkMetrics total={services.length} openCount={openPortsCount} closedCount={closedPortsCount} />
          <NetworkPortsTable services={services} />
        </div>
      )}

      {/* DIAGNÓSTICO Y REGLAS GENERADAS POR GEMINI AI */}
      {analysis && <NetworkAiDiagnosis targetHost={targetHost} analysis={analysis} />}
    </div>
  );
};