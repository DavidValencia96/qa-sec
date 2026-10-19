import React, { useState } from 'react';
import { runEasmAuditApi, type EasmAuditPayload } from '../services/api.client';

export interface DnsRecordItem {
  type: string;
  value: string;
}

export interface SubdomainItem {
  subdomain: string;
  ipAddress?: string;
  status: string;
}

export interface WafTechnologyDetails {
  wafDetected: boolean;
  wafName?: string;
  serverHeader?: string;
  detectedTechStack: string[];
}

export interface SslCertificateDetails {
  valid: boolean;
  issuer?: string;
  validTo?: string;
  daysRemaining?: number;
  weakProtocolsDetected: string[];
}

export interface EasmAuditResult {
  runId: string;
  targetDomain: string;
  dnsRecords: DnsRecordItem[];
  subdomains: SubdomainItem[];
  wafAndTech: WafTechnologyDetails;
  sslDetails: SslCertificateDetails;
  aiSummary?: {
    summary: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    recommendations: string[];
  };
}

export const EasmAuditTab: React.FC = () => {
  const [targetDomain, setTargetDomain] = useState('example.com');
  const [enableSubdomainDiscovery, setEnableSubdomainDiscovery] = useState(true);
  const [enableWafTechDetection, setEnableWafTechDetection] = useState(true);
  const [enableSslAudit, setEnableSslAudit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EasmAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDomain.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: EasmAuditPayload = {
        targetDomain: targetDomain.trim(),
        enableSubdomainDiscovery,
        enableWafTechDetection,
        enableSslAudit,
      };

      const data = await runEasmAuditApi(payload);
      if (data.success) {
        setResult(data.result as EasmAuditResult);
      } else {
        setError(data.error || 'Error al procesar la auditoría EASM.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#18181b', padding: '24px', borderRadius: '12px', border: '1px solid #27272a', color: '#f4f4f5' }}>
      {/* CABECERA */}
      <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#38bdf8', fontSize: '1.4rem' }}>
          🕸️ External Attack Surface Management (EASM & OSINT)
        </h2>
        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>
          Mapeo y reconocimiento perimetral en tiempo real: resolución DNS, subdominios activos, firmas WAF y certificados SSL.
        </p>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
            Dominio Objetivo (FQDN)
          </label>
          <input
            type="text"
            value={targetDomain}
            onChange={(e) => setTargetDomain(e.target.value)}
            placeholder="ej. mi-empresa.com"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              background: '#18181b',
              color: '#fff',
              border: '1px solid #3f3f46',
              fontSize: '0.95rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <label style={{ cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={enableSubdomainDiscovery}
              onChange={(e) => setEnableSubdomainDiscovery(e.target.checked)}
              disabled={loading}
            />
            🔍 Descubrimiento de Subdominios
          </label>

          <label style={{ cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={enableWafTechDetection}
              onChange={(e) => setEnableWafTechDetection(e.target.checked)}
              disabled={loading}
            />
            🛡️ Detección WAF & Headers HTTP
          </label>

          <label style={{ cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={enableSslAudit}
              onChange={(e) => setEnableSslAudit(e.target.checked)}
              disabled={loading}
            />
            🔒 Auditoría Certificado SSL/TLS
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#3f3f46' : '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? '🔄 Mapeando Perímetro...' : '🚀 Iniciar Auditoría EASM'}
        </button>
      </form>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div style={{ background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '14px', borderRadius: '6px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* RESULTADOS */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* DIAGNÓSTICO SINTÉTICO IA */}
          <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '1.05rem' }}>
              🤖 Diagnóstico Ejecutivo de Superficie (Gemini AI)
            </h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {result.aiSummary?.summary || 'Escaneo completado sin observaciones críticas.'}
            </p>

            {result.aiSummary?.recommendations && result.aiSummary.recommendations.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <strong style={{ color: '#f4f4f5', fontSize: '0.85rem' }}>💡 Medidas Recomendadas:</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', color: '#a1a1aa', fontSize: '0.88rem' }}>
                  {result.aiSummary.recommendations.map((rec: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* GRID TÉCNICO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* WAF & SERVIDOR */}
            <div style={{ background: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8' }}>🛡️ WAF & Perímetro</h4>
              <div style={{ fontSize: '0.88rem', color: '#a1a1aa' }}>
                <p>WAF Detectado: <strong style={{ color: result.wafAndTech?.wafDetected ? '#22c55e' : '#facc15' }}>{result.wafAndTech?.wafDetected ? result.wafAndTech?.wafName || 'Sí' : 'No Detectado'}</strong></p>
                <p>Encabezado Server: <strong style={{ color: '#f4f4f5' }}>{result.wafAndTech?.serverHeader || 'N/A'}</strong></p>
              </div>
            </div>

            {/* CERTIFICADO SSL */}
            <div style={{ background: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8' }}>🔒 Certificado SSL/TLS</h4>
              <div style={{ fontSize: '0.88rem', color: '#a1a1aa' }}>
                <p>Estado: <strong style={{ color: result.sslDetails?.valid ? '#22c55e' : '#ef4444' }}>{result.sslDetails?.valid ? 'VÁLIDO' : 'INVÁLIDO / EXPIRADO'}</strong></p>
                <p>Emisor: <strong style={{ color: '#f4f4f5' }}>{result.sslDetails?.issuer || 'N/A'}</strong></p>
                <p>Días Restantes: <strong style={{ color: '#38bdf8' }}>{result.sslDetails?.daysRemaining ?? 'N/A'} días</strong></p>
              </div>
            </div>
          </div>

          {/* TABLA REGISTROS DNS */}
          <div style={{ background: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#f4f4f5' }}>🌐 Registros DNS Obtenidos ({result.dnsRecords?.length || 0})</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #27272a', textAlign: 'left', color: '#a1a1aa' }}>
                    <th style={{ padding: '8px' }}>Tipo</th>
                    <th style={{ padding: '8px' }}>Valor / Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dnsRecords?.map((rec: DnsRecordItem, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #18181b' }}>
                      <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 'bold' }}>{rec.type}</td>
                      <td style={{ padding: '8px', fontFamily: 'monospace', color: '#e2e8f0' }}>{rec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUBDOMINIOS */}
          <div style={{ background: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#f4f4f5' }}>🔍 Subdominios Descubiertos ({result.subdomains?.length || 0})</h4>
            {result.subdomains?.length === 0 ? (
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>No se detectaron subdominios públicos adicionales.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {result.subdomains?.map((sub: SubdomainItem, idx: number) => (
                  <div key={idx} style={{ background: '#18181b', padding: '10px', borderRadius: '6px', border: '1px solid #27272a', fontSize: '0.85rem' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 'bold', wordBreak: 'break-all' }}>{sub.subdomain}</div>
                    <div style={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: '0.8rem', marginTop: '4px' }}>IP: {sub.ipAddress || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};