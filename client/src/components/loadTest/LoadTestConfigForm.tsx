import React, { useState } from 'react';
import type { LoadTestConfig } from './loadTest.types';

interface LoadTestConfigFormProps {
  onRunTest: (config: LoadTestConfig) => void;
  loading: boolean;
  initialConfig?: Partial<LoadTestConfig>;
}

export const LoadTestConfigForm: React.FC<LoadTestConfigFormProps> = ({
  onRunTest,
  loading,
  initialConfig,
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(
    initialConfig?.targetUrl || ''
  );
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>(
    initialConfig?.method || 'GET'
  );
  const [concurrency, setConcurrency] = useState<number>(initialConfig?.concurrency || 20);
  const [durationSeconds, setDurationSeconds] = useState<number>(
    initialConfig?.durationSeconds || 10
  );
  const [payloadJson, setPayloadJson] = useState<string>(initialConfig?.payloadJson || '');
  const [headersJson, setHeadersJson] = useState<string>(initialConfig?.headersJson || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim() || loading) return;

    onRunTest({
      targetUrl,
      method,
      concurrency,
      durationSeconds,
      payloadJson: method !== 'GET' ? payloadJson : undefined,
      headersJson: headersJson.trim() ? headersJson : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'rgba(9, 9, 11, 0.6)',
        padding: '20px 24px',
        borderRadius: '10px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        marginBottom: '24px',
      }}
    >
      <style>{`
        @keyframes spinner-rotator {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <h3
        style={{
          margin: '0 0 16px 0',
          color: '#38bdf8',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        ⚙️ Parametrización del Ataque / Carga Simulado
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '6px',
            }}
          >
            Método HTTP
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#38bdf8',
              fontWeight: 'bold',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '6px',
            }}
          >
            URL Objetivo Endpoint
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://api.midominio.com/v1/auth"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Clientes Concurrentes (Simultáneos):
            </label>
            <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>{concurrency}</strong>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
            disabled={loading}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Duración del Ataque (Segundos):
            </label>
            <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>{durationSeconds}s</strong>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            disabled={loading}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* CABECERAS PERSONALIZADAS */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            color: '#cbd5e1',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginBottom: '6px',
          }}
        >
          Cabeceras HTTP Personalizadas (JSON Headers) —{' '}
          <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>Opcional</span>
        </label>
        <textarea
          rows={2}
          value={headersJson}
          onChange={(e) => setHeadersJson(e.target.value)}
          placeholder='{"Authorization": "Bearer token_ejemplo", "X-Api-Key": "secret_key"}'
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'rgba(15, 23, 42, 0.7)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      {method !== 'GET' && (
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '6px',
            }}
          >
            Payload JSON (Body)
          </label>
          <textarea
            rows={3}
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            placeholder='{"username": "test", "password": "123"}'
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#86efac',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>
      )}

      {/* BOTÓN CON LOADER ANIMADO */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '8px',
          border: loading ? '1px solid #475569' : '1px solid #ef4444',
          background: loading
            ? 'rgba(51, 65, 85, 0.6)'
            : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '0.95rem',
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: loading ? 'none' : '0 0 20px rgba(239, 68, 68, 0.35)',
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: '18px',
                height: '18px',
                border: '3px solid rgba(56, 189, 248, 0.3)',
                borderTop: '3px solid #38bdf8',
                borderRadius: '50%',
                animation: 'spinner-rotator 0.8s linear infinite',
                display: 'inline-block',
              }}
            />
            <span>🚀 Ejecutando Ráfaga de Estrés ({durationSeconds}s)...</span>
          </>
        ) : (
          '🔥 Iniciar Prueba de Carga & DoS'
        )}
      </button>
    </form>
  );
};