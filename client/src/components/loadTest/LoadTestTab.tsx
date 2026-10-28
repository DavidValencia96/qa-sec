import React, { useState } from 'react';
import { LoadTestConfigForm } from './LoadTestConfigForm';
import { LoadTestMetricsCard } from './LoadTestMetricsCard';
import { runLoadTestApi } from '../../services/api.client';
import type { LoadTestConfig, LoadTestResult } from './loadTest.types';
import { ModuleGuard } from '../auth/ModuleGuard';

export interface LoadTestApiResponse extends Partial<LoadTestResult> {
  success?: boolean;
  error?: string;
  runId?: string;
}

export interface LoadTestModuleData {
  config?: LoadTestConfig;
  result: LoadTestResult | null;
}

interface LoadTestTabProps {
  loadTestData?: LoadTestModuleData;
  onUpdateLoadTestData?: (data: Partial<LoadTestModuleData>) => void;
}

export const LoadTestTab: React.FC<LoadTestTabProps> = ({
  loadTestData,
  onUpdateLoadTestData,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LoadTestResult | null>(loadTestData?.result || null);
  const [error, setError] = useState<string | null>(null);

  const [prevLoadTestData, setPrevLoadTestData] = useState(loadTestData);
  if (loadTestData !== prevLoadTestData) {
    setPrevLoadTestData(loadTestData);
    if (loadTestData?.result !== undefined) setResult(loadTestData.result);
  }

  const handleRunTest = async (config: LoadTestConfig) => {
    setLoading(true);
    setError(null);
    try {
      const data = (await runLoadTestApi(config)) as LoadTestApiResponse;

      if (data && data.metrics && data.aiDiagnosis) {
        const validResult: LoadTestResult = {
          runId: data.runId || `load-run-${Date.now()}`,
          config: data.config || config,
          metrics: data.metrics,
          aiDiagnosis: data.aiDiagnosis,
        };

        setResult(validResult);

        if (onUpdateLoadTestData) {
          onUpdateLoadTestData({
            config,
            result: validResult,
          });
        }
      } else {
        setError(data?.error || 'Ocurrió un fallo durante la ejecución de la prueba.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleGuard moduleKey="LOADTEST" moduleTitle="Pruebas de Carga (Stress & DoS)">
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
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
              🎯 Pruebas de Carga & Resiliencia DoS (Stress Testing)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
              Audita la resiliencia de endpoints HTTP simulando ráfagas de alta concurrencia. Evalúa el comportamiento del servidor ante bloqueos de Event Loop y verifica la presencia de políticas defensivas de Rate Limiting (OWASP API4:2023).
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
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
              alignSelf: 'flex-start',
            }}
          >
            Stress & Resiliency Security
          </span>
        </div>

        <LoadTestConfigForm
          onRunTest={handleRunTest}
          loading={loading}
          initialConfig={loadTestData?.config}
        />

        {error && (
          <div
            style={{
              background: 'rgba(127, 29, 29, 0.3)',
              color: '#f87171',
              padding: '14px 18px',
              borderRadius: '8px',
              border: '1px solid #ef4444',
              marginBottom: '20px',
              fontSize: '0.9rem',
            }}
          >
            ⚠️ Error al ejecutar la prueba de estrés: {error}
          </div>
        )}

        {result && <LoadTestMetricsCard result={result} />}
      </div>
    </ModuleGuard>
  );
};