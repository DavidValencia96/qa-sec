import React, { useState } from 'react';
import type { LoadTestConfig } from './loadTest.types';

interface LoadTestConfigFormProps {
  onRunTest: (config: LoadTestConfig) => void;
  loading: boolean;
}

export const LoadTestConfigForm: React.FC<LoadTestConfigFormProps> = ({ onRunTest, loading }) => {
  const [targetUrl, setTargetUrl] = useState<string>('http://localhost:3000/api/projects');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [concurrency, setConcurrency] = useState<number>(20);
  const [durationSeconds, setDurationSeconds] = useState<number>(10);
  const [payloadJson, setPayloadJson] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    onRunTest({
      targetUrl,
      method,
      concurrency,
      durationSeconds,
      payloadJson: method !== 'GET' ? payloadJson : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '24px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#f4f4f5' }}>⚙️ Parametrización del Ataque / Carga Simulado</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Método HTTP</label>
            <select
            value={method}
            onChange={(e) => setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
            disabled={loading}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46' }}
            >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>URL Objetivo Endpoint</label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://api.midominio.com/v1/auth"
            required
            disabled={loading}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
            Clientes Concurrentes (Simultáneos): <strong style={{ color: '#38bdf8' }}>{concurrency}</strong>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
            disabled={loading}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
            Duración del Ataque (Segundos): <strong style={{ color: '#38bdf8' }}>{durationSeconds}s</strong>
          </label>
          <input
            type="range"
            min="2"
            max="30"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            disabled={loading}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {method !== 'GET' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Payload JSON (Body)</label>
          <textarea
            rows={3}
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            placeholder='{"username": "test", "password": "123"}'
            disabled={loading}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#09090b', color: '#86efac', border: '1px solid #3f3f46', fontFamily: 'monospace', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: 'none',
          background: loading ? '#3f3f46' : '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s ease',
        }}
      >
        {loading ? '🚀 Ejecutando Ráfaga de Estrés...' : '🔥 Iniciar Prueba de Carga & DoS'}
      </button>
    </form>
  );
};