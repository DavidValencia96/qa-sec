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

export interface EasmModuleData {
  targetDomain: string;
  enableSubdomainDiscovery: boolean;
  enableWafTechDetection: boolean;
  enableSslAudit: boolean;
  result: EasmAuditResult | null;
}

interface EasmAuditTabProps {
  easmData?: EasmModuleData;
  onUpdateEasmData?: (data: Partial<EasmModuleData>) => void;
}

export const EasmAuditTab: React.FC<EasmAuditTabProps> = ({
  easmData,
  onUpdateEasmData,
}) => {
  const [targetDomain, setTargetDomain] = useState<string>(
    easmData?.targetDomain || 'example.com'
  );
  const [enableSubdomainDiscovery, setEnableSubdomainDiscovery] = useState<boolean>(
    easmData?.enableSubdomainDiscovery ?? true
  );
  const [enableWafTechDetection, setEnableWafTechDetection] = useState<boolean>(
    easmData?.enableWafTechDetection ?? true
  );
  const [enableSslAudit, setEnableSslAudit] = useState<boolean>(
    easmData?.enableSslAudit ?? true
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EasmAuditResult | null>(
    easmData?.result || null
  );
  const [error, setError] = useState<string | null>(null);

  // Popover de ayuda al pasar el mouse por los íconos ❓
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Derivación segura de estado al cambiar de pestaña
  const [prevEasmData, setPrevEasmData] = useState(easmData);
  if (easmData !== prevEasmData) {
    setPrevEasmData(easmData);
    if (easmData?.targetDomain !== undefined) setTargetDomain(easmData.targetDomain);
    if (easmData?.enableSubdomainDiscovery !== undefined) setEnableSubdomainDiscovery(easmData.enableSubdomainDiscovery);
    if (easmData?.enableWafTechDetection !== undefined) setEnableWafTechDetection(easmData.enableWafTechDetection);
    if (easmData?.enableSslAudit !== undefined) setEnableSslAudit(easmData.enableSslAudit);
    if (easmData?.result !== undefined) setResult(easmData.result);
  }

  const handleUpdateGlobalState = (patch: Partial<EasmModuleData>) => {
    if (onUpdateEasmData) {
      onUpdateEasmData(patch);
    }
  };

  // Cargar Ejemplo Funcional
  const handleLoadExample = () => {
    const exampleDomain = 'google.com';
    setTargetDomain(exampleDomain);
    setEnableSubdomainDiscovery(true);
    setEnableWafTechDetection(true);
    setEnableSslAudit(true);

    handleUpdateGlobalState({
      targetDomain: exampleDomain,
      enableSubdomainDiscovery: true,
      enableWafTechDetection: true,
      enableSslAudit: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDomain.trim() || loading) return;

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
      if (data && data.success) {
        const auditData = data.result as EasmAuditResult;
        setResult(auditData);
        handleUpdateGlobalState({ result: auditData });
      } else {
        setError(data?.error || 'Error al procesar la auditoría EASM.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Renderizador de Popovers flotantes de ayuda
  const renderHelpIcon = (id: string, text: string) => (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }}>
      <span
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip(null)}
        style={{
          cursor: 'pointer',
          color: '#38bdf8',
          fontSize: '0.78rem',
          fontWeight: 'bold',
          background: 'rgba(56, 189, 248, 0.15)',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #38bdf8',
        }}
      >
        ?
      </span>

      {activeTooltip === id && (
        <div
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.98)',
            color: '#e2e8f0',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            width: '260px',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
            backdropFilter: 'blur(8px)',
            zIndex: 99,
            lineHeight: '1.4',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );

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
      <style>{`
        @keyframes spinner-rotator {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* CABECERA ENTERPRISE ALINEADA CON BADGE Y BOTÓN EJEMPLO */}
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
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🕸️ External Attack Surface Management (EASM & OSINT)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Mapeo y reconocimiento perimetral en tiempo real: resolución DNS, subdominios activos, firmas WAF y certificados SSL.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          {/* BOTÓN IMPLEMENTAR EJEMPLO */}
          <button
            type="button"
            onClick={handleLoadExample}
            disabled={loading}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid #38bdf8',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ Cargar Ejemplo Funcional
          </button>

          {/* BADGE CATEGORÍA */}
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
            }}
          >
            EASM & OSINT Recon
          </span>
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} style={{ background: 'rgba(9, 9, 11, 0.6)', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
            Dominio Objetivo (FQDN)
            {renderHelpIcon('domain', 'Ingresa el nombre de dominio principal a auditar (ej: google.com).')}
          </label>
          <input
            type="text"
            value={targetDomain}
            onChange={(e) => {
              setTargetDomain(e.target.value);
              handleUpdateGlobalState({ targetDomain: e.target.value });
            }}
            placeholder="ej. mi-empresa.com"
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableSubdomainDiscovery}
              onChange={(e) => {
                setEnableSubdomainDiscovery(e.target.checked);
                handleUpdateGlobalState({ enableSubdomainDiscovery: e.target.checked });
              }}
              disabled={loading}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>🔍 Descubrimiento de Subdominios</span>
            {renderHelpIcon('subdomains', 'Enumeración pasiva y consulta de registros para identificar subdominios activos.')}
          </label>

          <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableWafTechDetection}
              onChange={(e) => {
                setEnableWafTechDetection(e.target.checked);
                handleUpdateGlobalState({ enableWafTechDetection: e.target.checked });
              }}
              disabled={loading}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>🛡️ Detección WAF & Headers HTTP</span>
            {renderHelpIcon('waf', 'Identifica la presencia de Web Application Firewalls (Cloudflare, AWS WAF, Akamai) y encabezados del servidor.')}
          </label>

          <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableSslAudit}
              onChange={(e) => {
                setEnableSslAudit(e.target.checked);
                handleUpdateGlobalState({ enableSslAudit: e.target.checked });
              }}
              disabled={loading}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>🔒 Auditoría Certificado SSL/TLS</span>
            {renderHelpIcon('ssl', 'Evalúa la validez, entidad emisora y días restantes del certificado TLS.')}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !targetDomain.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #38bdf8',
            background: loading
              ? 'rgba(51, 65, 85, 0.6)'
              : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: loading || !targetDomain.trim() ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: loading ? 'none' : '0 0 20px rgba(56, 189, 248, 0.35)',
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
              <span>Mapeando Perímetro y Consultando Registros...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Iniciar Auditoría EASM</span>
            </>
          )}
        </button>
      </form>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div style={{ background: 'rgba(127, 29, 29, 0.3)', border: '1px solid #ef4444', color: '#f87171', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* RESULTADOS */}
      {result && (
        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* DIAGNÓSTICO SINTÉTICO IA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#38bdf8', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🤖 Diagnóstico Ejecutivo de Superficie (Gemini AI)
            </h3>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {result.aiSummary?.summary || 'Escaneo completado sin observaciones críticas.'}
            </p>

            {result.aiSummary?.recommendations && result.aiSummary.recommendations.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <strong style={{ color: '#facc15', fontSize: '0.85rem' }}>💡 Medidas Recomendadas:</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
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
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '0.95rem' }}>🛡️ WAF & Perímetro</h4>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                <div>WAF Detectado: <strong style={{ color: result.wafAndTech?.wafDetected ? '#4ade80' : '#facc15' }}>{result.wafAndTech?.wafDetected ? result.wafAndTech?.wafName || 'Sí' : 'No Detectado'}</strong></div>
                <div>Encabezado Server: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{result.wafAndTech?.serverHeader || 'N/A'}</strong></div>
              </div>
            </div>

            {/* CERTIFICADO SSL */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '0.95rem' }}>🔒 Certificado SSL/TLS</h4>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                <div>Estado: <strong style={{ color: result.sslDetails?.valid ? '#4ade80' : '#f87171' }}>{result.sslDetails?.valid ? 'VÁLIDO' : 'INVÁLIDO / EXPIRADO'}</strong></div>
                <div>Emisor: <strong style={{ color: '#ffffff' }}>{result.sslDetails?.issuer || 'N/A'}</strong></div>
                <div>Días Restantes: <strong style={{ color: '#38bdf8' }}>{result.sslDetails?.daysRemaining ?? 'N/A'} días</strong></div>
              </div>
            </div>
          </div>

          {/* TABLA REGISTROS DNS */}
          <div style={{ background: 'rgba(9, 9, 11, 0.7)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ margin: '0 0 14px 0', color: '#ffffff', fontSize: '0.95rem' }}>
              🌐 Registros DNS Obtenidos ({result.dnsRecords?.length || 0})
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Tipo</th>
                    <th style={{ padding: '8px 12px' }}>Valor / Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {result.dnsRecords?.map((rec: DnsRecordItem, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#cbd5e1' }}>
                      <td style={{ padding: '8px 12px', color: '#38bdf8', fontWeight: 'bold' }}>{rec.type}</td>
                      <td style={{ padding: '8px 12px', wordBreak: 'break-all' }}>{rec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUBDOMINIOS */}
          <div style={{ background: 'rgba(9, 9, 11, 0.7)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ margin: '0 0 14px 0', color: '#ffffff', fontSize: '0.95rem' }}>
              🔍 Subdominios Descubiertos ({result.subdomains?.length || 0})
            </h4>
            {result.subdomains?.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No se detectaron subdominios públicos adicionales.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {result.subdomains?.map((sub: SubdomainItem, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.88rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {sub.subdomain}
                    </div>
                    <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.78rem', marginTop: '4px' }}>
                      IP: {sub.ipAddress || 'N/A'}
                    </div>
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