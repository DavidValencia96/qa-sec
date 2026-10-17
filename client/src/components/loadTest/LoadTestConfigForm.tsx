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
  const [headersJson, setHeadersJson] = useState<string>('');

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
    <form onSubmit={handleSubmit} style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '24px' }}>
      {/* CSS Inyectado para la animación del Spinner */}
      <style>{`
        @keyframes spinner-rotator {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

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

      {/* CABECERAS PERSONALIZADAS */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
          Cabeceras HTTP Personalizadas (JSON Headers) — <em>Opcional</em>
        </label>
        <textarea
          rows={2}
          value={headersJson}
          onChange={(e) => setHeadersJson(e.target.value)}
          placeholder='{"Authorization": "Bearer token_ejemplo", "X-Api-Key": "secret_key"}'
          disabled={loading}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#09090b', color: '#38bdf8', border: '1px solid #3f3f46', fontFamily: 'monospace', boxSizing: 'border-box' }}
        />
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

      {/* BOTÓN CON LOADER ANIMADO Y PUNTERO WAIT */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: 'none',
          background: loading ? '#27272a' : '#ef4444',
          color: loading ? '#38bdf8' : '#fff',
          fontWeight: 'bold',
          fontSize: '1rem',
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: loading ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
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
            🚀 Ejecutando Ráfaga de Estrés ({durationSeconds}s)...
          </>
        ) : (
          '🔥 Iniciar Prueba de Carga & DoS'
        )}
      </button>
    </form>
  );
};