import React, { useState } from 'react';
import { runEmailSecAuditApi, type EmailSecAuditPayload } from '../services/api.client';
import { ModuleGuard } from '../components/auth/ModuleGuard';

export interface EmailSecResultState {
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

export interface EmailSecModuleData {
  activeSubTab: 'domain' | 'ip' | 'headers';
  domain: string;
  dkimSelector: string;
  targetIp: string;
  rawHeaders: string;
  results?: {
    domain?: EmailSecResultState | null;
    ip?: EmailSecResultState | null;
    headers?: EmailSecResultState | null;
  };
  result?: EmailSecResultState | null;
}

interface EmailSecAuditTabProps {
  emailSecData?: EmailSecModuleData;
  onUpdateEmailSecData?: (data: Partial<EmailSecModuleData>) => void;
}

export const EmailSecAuditTab: React.FC<EmailSecAuditTabProps> = ({
  emailSecData,
  onUpdateEmailSecData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'domain' | 'ip' | 'headers'>(
    emailSecData?.activeSubTab || 'domain'
  );

  const [domain, setDomain] = useState<string>(emailSecData?.domain || 'google.com');
  const [dkimSelector, setDkimSelector] = useState<string>(emailSecData?.dkimSelector || 'google');
  const [targetIp, setTargetIp] = useState<string>(emailSecData?.targetIp || '');
  const [rawHeaders, setRawHeaders] = useState<string>(emailSecData?.rawHeaders || '');

  const [loadingMap, setLoadingMap] = useState<Record<'domain' | 'ip' | 'headers', boolean>>({
    domain: false,
    ip: false,
    headers: false,
  });

  const [resultsMap, setResultsMap] = useState<Record<'domain' | 'ip' | 'headers', EmailSecResultState | null>>({
    domain: emailSecData?.results?.domain || (emailSecData?.activeSubTab === 'domain' ? emailSecData.result : null) || null,
    ip: emailSecData?.results?.ip || (emailSecData?.activeSubTab === 'ip' ? emailSecData.result : null) || null,
    headers: emailSecData?.results?.headers || (emailSecData?.activeSubTab === 'headers' ? emailSecData.result : null) || null,
  });

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [prevEmailSecData, setPrevEmailSecData] = useState(emailSecData);
  if (emailSecData !== prevEmailSecData) {
    setPrevEmailSecData(emailSecData);
    if (emailSecData?.activeSubTab !== undefined) setActiveSubTab(emailSecData.activeSubTab);
    if (emailSecData?.domain !== undefined) setDomain(emailSecData.domain);
    if (emailSecData?.dkimSelector !== undefined) setDkimSelector(emailSecData.dkimSelector);
    if (emailSecData?.targetIp !== undefined) setTargetIp(emailSecData.targetIp);
    if (emailSecData?.rawHeaders !== undefined) setRawHeaders(emailSecData.rawHeaders);

    if (emailSecData?.results) {
      setResultsMap({
        domain: emailSecData.results.domain ?? null,
        ip: emailSecData.results.ip ?? null,
        headers: emailSecData.results.headers ?? null,
      });
    }
  }

  const handleUpdateGlobalState = (patch: Partial<EmailSecModuleData>) => {
    if (onUpdateEmailSecData) {
      onUpdateEmailSecData(patch);
    }
  };

  const handleLoadExample = () => {
    const exampleDomain = 'google.com';
    const exampleSelector = 'google';
    const exampleIp = '172.217.162.142';
    const exampleHeaders =
      'Received: from mail-pj1-f41.google.com (mail-pj1-f41.google.com [209.85.216.41])\nAuthentication-Results: spf=pass (google.com: domain of user@google.com designates 209.85.216.41 as permitted sender)\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=20230601;\nSubject: Notificación de Seguridad de Cuenta';

    setDomain(exampleDomain);
    setDkimSelector(exampleSelector);
    setTargetIp(exampleIp);
    setRawHeaders(exampleHeaders);

    handleUpdateGlobalState({
      domain: exampleDomain,
      dkimSelector: exampleSelector,
      targetIp: exampleIp,
      rawHeaders: exampleHeaders,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentTab = activeSubTab;
    if (loadingMap[currentTab]) return;

    setLoadingMap((prev) => ({ ...prev, [currentTab]: true }));

    try {
      const payload: EmailSecAuditPayload = {};
      if (currentTab === 'domain') {
        payload.domain = domain;
        payload.dkimSelector = dkimSelector;
      } else if (currentTab === 'ip') {
        payload.targetIp = targetIp;
      } else if (currentTab === 'headers') {
        payload.rawHeaders = rawHeaders;
      }

      const data = await runEmailSecAuditApi(payload);
      const resState = data as EmailSecResultState;

      setResultsMap((prev) => {
        const updated = { ...prev, [currentTab]: resState };
        handleUpdateGlobalState({
          results: updated,
          result: resState,
        });
        return updated;
      });
    } catch (err) {
      alert(`Error en la auditoría: ${(err as Error).message}`);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [currentTab]: false }));
    }
  };

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

  const isCurrentTabLoading = loadingMap[activeSubTab];
  const currentTabResult = resultsMap[activeSubTab];

  return (
    <ModuleGuard moduleKey="EMAILSEC" moduleTitle="Seguridad de Email y DNS (Anti-Spoofing)">
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
              📧 Email Security & Defense (OSINT / Anti-Phishing)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
              Auditoría en tiempo real de registros autenticados (SPF, DMARC, DKIM), reputación de IP en listas negras (RBL) y detección de spoofing en encabezados reales.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
            <button
              type="button"
              onClick={handleLoadExample}
              disabled={isCurrentTabLoading}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid #38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                cursor: isCurrentTabLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              ⚡ Cargar Ejemplo Funcional
            </button>

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
              Email & Anti-Phishing
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('domain');
              handleUpdateGlobalState({ activeSubTab: 'domain' });
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: activeSubTab === 'domain' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              background: activeSubTab === 'domain' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)',
              color: activeSubTab === 'domain' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'domain' ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none',
            }}
          >
            🌐 Dominio & Registros DNS
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('ip');
              handleUpdateGlobalState({ activeSubTab: 'ip' });
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: activeSubTab === 'ip' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              background: activeSubTab === 'ip' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)',
              color: activeSubTab === 'ip' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'ip' ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none',
            }}
          >
            🛡️ Reputación IP (RBL)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('headers');
              handleUpdateGlobalState({ activeSubTab: 'headers' });
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: activeSubTab === 'headers' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              background: activeSubTab === 'headers' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)',
              color: activeSubTab === 'headers' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === 'headers' ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none',
            }}
          >
            📑 Forensia de Encabezados (.eml)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(9, 9, 11, 0.6)', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '24px' }}>
          {activeSubTab === 'domain' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Dominio a Auditar:
                  {renderHelpIcon('domain', 'Nombre del dominio para validar políticas de correo SPF, DMARC y registros MX.')}
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    handleUpdateGlobalState({ domain: e.target.value });
                  }}
                  placeholder="ej. paypal.com"
                  required
                  disabled={isCurrentTabLoading}
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

              <div>
                <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Selector DKIM:
                  {renderHelpIcon('dkim', 'Nombre del selector publicado en el DNS para verificar la firma DKIM (ej: google, default, k1).')}
                </label>
                <input
                  type="text"
                  value={dkimSelector}
                  onChange={(e) => {
                    setDkimSelector(e.target.value);
                    handleUpdateGlobalState({ dkimSelector: e.target.value });
                  }}
                  placeholder="ej. google o default"
                  disabled={isCurrentTabLoading}
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
            </div>
          )}

          {activeSubTab === 'ip' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Dirección IPv4 del Servidor de Correo:
                {renderHelpIcon('ip', 'IPv4 del servidor SMTP para comprobar reputación en listas RBL (Spamhaus, Barracuda).')}
              </label>
              <input
                type="text"
                value={targetIp}
                onChange={(e) => {
                  setTargetIp(e.target.value);
                  handleUpdateGlobalState({ targetIp: e.target.value });
                }}
                placeholder="ej. 185.220.101.5"
                required
                disabled={isCurrentTabLoading}
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
          )}

          {activeSubTab === 'headers' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Código Fuente / Encabezados del Correo Raw:
                {renderHelpIcon('headers', 'Pega los encabezados completos (Received:, From:, Return-Path:) para auditar ataques de suplantación/spoofing.')}
              </label>
              <textarea
                value={rawHeaders}
                onChange={(e) => {
                  setRawHeaders(e.target.value);
                  handleUpdateGlobalState({ rawHeaders: e.target.value });
                }}
                placeholder="Pega aquí los encabezados Received:, From:, Return-Path:..."
                rows={6}
                required
                disabled={isCurrentTabLoading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#38bdf8',
                  fontSize: '0.85rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={isCurrentTabLoading}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: '12px 24px',
                borderRadius: '10px',
                border: isCurrentTabLoading ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid #38bdf8',
                backgroundColor: isCurrentTabLoading
                  ? 'rgba(30, 41, 59, 0.5)'
                  : 'rgba(2, 132, 199, 0.85)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                letterSpacing: '0.5px',
                cursor: isCurrentTabLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isCurrentTabLoading ? 'none' : '0 0 16px rgba(56, 189, 248, 0.35)',
                transition: 'all 0.2s ease',
                opacity: isCurrentTabLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isCurrentTabLoading) {
                  e.currentTarget.style.backgroundColor = '#0284c7';
                  e.currentTarget.style.boxShadow = '0 0 22px rgba(56, 189, 248, 0.55)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrentTabLoading) {
                  e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.85)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.35)';
                }
              }}
            >
              {isCurrentTabLoading ? (
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
                  <span>Escaneando en tiempo real...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Ejecutar Auditoría de Email Security</span>
                </>
              )}
            </button>
          </div>
        </form>

        {currentTabResult && (
          <div style={{ marginTop: '28px', background: 'rgba(9, 9, 11, 0.6)', padding: '24px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <h3 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Diagnóstico IA y Seguridad de Correo
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {currentTabResult.aiSummary?.summary}
            </p>

            {activeSubTab === 'domain' && currentTabResult.spf && (
              <div style={{ marginTop: '16px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>📋 Registro SPF:</h4>
                <pre style={{ color: currentTabResult.spf.valid ? '#4ade80' : '#ef4444', margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {currentTabResult.spf.raw || 'Sin registro SPF configurado'}
                </pre>
                {currentTabResult.spf.warnings?.map((w: string, i: number) => (
                  <small key={i} style={{ color: '#f97316', display: 'block', marginTop: '6px' }}>⚠️ {w}</small>
                ))}
              </div>
            )}

            {activeSubTab === 'domain' && currentTabResult.dmarc && (
              <div style={{ marginTop: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>🛡️ Registro DMARC:</h4>
                <pre style={{ color: currentTabResult.dmarc.valid ? '#4ade80' : '#ef4444', margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {currentTabResult.dmarc.raw || 'Sin registro DMARC configurado'}
                </pre>
                {currentTabResult.dmarc.warnings?.map((w: string, i: number) => (
                  <small key={i} style={{ color: '#f97316', display: 'block', marginTop: '6px' }}>⚠️ {w}</small>
                ))}
              </div>
            )}

            {activeSubTab === 'ip' && currentTabResult.rbl && (
              <div style={{ marginTop: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                  🛑 Reputación RBL en Listas Negras (IP: {currentTabResult.rbl.ip}):
                </h4>
                {currentTabResult.rbl.blacklisted ? (
                  <p style={{ color: '#ef4444', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>
                    🚨 La IP está reportada en {currentTabResult.rbl.listedIn.length} lista(s) negra(s): {currentTabResult.rbl.listedIn.join(', ')}
                  </p>
                ) : (
                  <p style={{ color: '#4ade80', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>
                    ✅ La IP se encuentra limpia en todos los proveedores RBL consultados.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ModuleGuard>
  );
};