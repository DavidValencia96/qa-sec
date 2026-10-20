import React, { useState } from 'react';
import { runEmailSecAuditApi, type EmailSecAuditPayload } from '../services/api.client';

interface EmailSecResultState {
  success?: boolean;
  runId?: string;
  spf?: {
    raw: string | null;
    valid: boolean;
    policy: string;
    warnings: string[];
  };
  dmarc?: {
    raw: string | null;
    valid: boolean;
    policy: string;
    warnings: string[];
  };
  rbl?: {
    ip: string;
    blacklisted: boolean;
    listedIn: string[];
    cleanIn: string[];
  };
  aiSummary?: {
    summary: string;
    riskLevel: string;
  };
}

export const EmailSecAuditTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'domain' | 'ip' | 'headers'>('domain');
  const [domain, setDomain] = useState('google.com');
  const [dkimSelector, setDkimSelector] = useState('google');
  const [targetIp, setTargetIp] = useState('');
  const [rawHeaders, setRawHeaders] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailSecResultState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload: EmailSecAuditPayload = {};
      if (activeSubTab === 'domain') {
        payload.domain = domain;
        payload.dkimSelector = dkimSelector;
      } else if (activeSubTab === 'ip') {
        payload.targetIp = targetIp;
      } else if (activeSubTab === 'headers') {
        payload.rawHeaders = rawHeaders;
      }

      const data = await runEmailSecAuditApi(payload);
      setResult(data as EmailSecResultState);
    } catch (err) {
      alert(`Error en la auditoría: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '24px', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ color: '#fff', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        📧 Email Security & Defense (OSINT / Anti-Phishing)
      </h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '20px' }}>
        Auditoría en tiempo real de registros autenticados (SPF, DMARC, DKIM), reputación de IP en listas negras (RBL) y detección de spoofing en encabezados reales.
      </p>

      {/* Sub-navegación por tipo de consulta */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('domain')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            background: activeSubTab === 'domain' ? '#2563eb' : '#27272a',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSubTab === 'domain' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
          }}
        >
          🌐 Dominio & Registros DNS
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('ip')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            background: activeSubTab === 'ip' ? '#2563eb' : '#27272a',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSubTab === 'ip' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
          }}
        >
          🛡️ Reputación IP (RBL)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('headers')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            background: activeSubTab === 'headers' ? '#2563eb' : '#27272a',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeSubTab === 'headers' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
          }}
        >
          📑 Forensia de Encabezados (.eml)
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        {activeSubTab === 'domain' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
                Dominio a Auditar:
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="ej. paypal.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #3f3f46',
                  color: '#fff',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
                Selector DKIM:
              </label>
              <input
                type="text"
                value={dkimSelector}
                onChange={(e) => setDkimSelector(e.target.value)}
                placeholder="ej. google o default"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #3f3f46',
                  color: '#fff',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        )}

        {activeSubTab === 'ip' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Dirección IPv4 del Servidor de Correo:
            </label>
            <input
              type="text"
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              placeholder="ej. 185.220.101.5"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#09090b',
                border: '1px solid #3f3f46',
                color: '#fff',
                borderRadius: '6px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
        )}

        {activeSubTab === 'headers' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Código Fuente / Encabezados del Correo Raw:
            </label>
            <textarea
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              placeholder="Pega aquí los encabezados Received:, From:, Return-Path:..."
              rows={6}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#09090b',
                border: '1px solid #3f3f46',
                color: '#fff',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#3f3f46' : '#2563eb',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : '0 0 12px rgba(37, 99, 235, 0.4)',
          }}
        >
          {loading ? '⏳ Escaneando en tiempo real...' : '🚀 Ejecutar Auditoría de Email Security'}
        </button>
      </form>

      {/* Resultados */}
      {result && (
        <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
          <h3 style={{ color: '#38bdf8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Diagnóstico IA y Seguridad de Correo
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>{result.aiSummary?.summary}</p>

          {result.spf && (
            <div style={{ marginTop: '16px', background: '#18181b', padding: '14px', borderRadius: '6px', border: '1px solid #27272a' }}>
              <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>📋 Registro SPF:</h4>
              <pre style={{ color: result.spf.valid ? '#4ade80' : '#ef4444', margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {result.spf.raw || 'Sin registro SPF configurado'}
              </pre>
              {result.spf.warnings?.map((w: string, i: number) => (
                <small key={i} style={{ color: '#f97316', display: 'block', marginTop: '6px' }}>⚠️ {w}</small>
              ))}
            </div>
          )}

          {result.dmarc && (
            <div style={{ marginTop: '12px', background: '#18181b', padding: '14px', borderRadius: '6px', border: '1px solid #27272a' }}>
              <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>🛡️ Registro DMARC:</h4>
              <pre style={{ color: result.dmarc.valid ? '#4ade80' : '#ef4444', margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {result.dmarc.raw || 'Sin registro DMARC configurado'}
              </pre>
              {result.dmarc.warnings?.map((w: string, i: number) => (
                <small key={i} style={{ color: '#f97316', display: 'block', marginTop: '6px' }}>⚠️ {w}</small>
              ))}
            </div>
          )}

          {result.rbl && (
            <div style={{ marginTop: '12px', background: '#18181b', padding: '14px', borderRadius: '6px', border: '1px solid #27272a' }}>
              <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                🛑 Reputación RBL en Listas Negras (IP: {result.rbl.ip}):
              </h4>
              {result.rbl.blacklisted ? (
                <p style={{ color: '#ef4444', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>
                  🚨 La IP está reportada en {result.rbl.listedIn.length} lista(s) negra(s): {result.rbl.listedIn.join(', ')}
                </p>
              ) : (
                <p style={{ color: '#22c55e', margin: 0, fontSize: '0.9rem' }}>
                  ✅ La IP se encuentra limpia en todos los proveedores RBL consultados.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};