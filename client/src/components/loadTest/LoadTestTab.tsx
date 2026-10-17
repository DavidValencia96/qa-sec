import React, { useState } from 'react';
import { LoadTestConfigForm } from './LoadTestConfigForm';
import { LoadTestMetricsCard } from './LoadTestMetricsCard';
import { runLoadTestApi } from '../../services/api.client';
import type { LoadTestConfig, LoadTestResult } from './loadTest.types';

export const LoadTestTab: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LoadTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunTest = async (config: LoadTestConfig) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runLoadTestApi(config);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#09090b', padding: '24px', borderRadius: '8px', border: '1px solid #27272a' }}>
      <h2 style={{ marginTop: 0, color: '#38bdf8' }}>🎯 Pruebas de Carga & Resiliencia DoS (Stress Testing)</h2>
      <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '20px' }}>
        Audita la resiliencia de endpoints HTTP simulando ráfagas de alta concurrencia. Evalúa el comportamiento del servidor ante bloqueos de Event Loop y verifica la presencia de políticas defensivas de Rate Limiting (OWASP API4:2023).
      </p>

      <LoadTestConfigForm onRunTest={handleRunTest} loading={loading} />

      {error && (
        <div style={{ background: '#450a0a', color: '#f87171', padding: '12px 16px', borderRadius: '6px', border: '1px solid #991b1b', marginBottom: '20px' }}>
          ⚠️ Error al ejecutar la prueba de estrés: {error}
        </div>
      )}

      {result && <LoadTestMetricsCard result={result} />}
    </div>
  );
};