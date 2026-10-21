import React, { useState } from 'react';
import { runRedTeamAuditApi, exportSingleRecordApi } from '../../services/api.client';

export interface JwtFindingItem {
  vulnerabilityType: string;
  severity: string;
  description: string;
  remediation: string;
}

export interface CorsFindingItem {
  vulnerabilityType: string;
  testedOrigin: string;
  description: string;
  remediation: string;
}

export interface RedTeamAuditResult {
  runId?: string;
  phishingSimulatedCount?: number;
  aiSummary?: {
    summary: string;
  };
  jwtFindings?: JwtFindingItem[];
  corsFindings?: CorsFindingItem[];
}

export interface RedTeamModuleData {
  targetUrl: string;
  jwtToken: string;
  enableJwt: boolean;
  enableCors: boolean;
  result: RedTeamAuditResult | null;
}

interface RedTeamAuditTabProps {
  redTeamData?: RedTeamModuleData;
  onUpdateRedTeamData?: (data: Partial<RedTeamModuleData>) => void;
}

export const RedTeamAuditTab: React.FC<RedTeamAuditTabProps> = ({
  redTeamData,
  onUpdateRedTeamData,
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(
    redTeamData?.targetUrl || 'http://localhost:3000/api/users'
  );
  const [jwtToken, setJwtToken] = useState<string>(
    redTeamData?.jwtToken || ''
  );
  const [enableJwt, setEnableJwt] = useState<boolean>(
    redTeamData?.enableJwt ?? true
  );
  const [enableCors, setEnableCors] = useState<boolean>(
    redTeamData?.enableCors ?? true
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RedTeamAuditResult | null>(
    redTeamData?.result || null
  );

  // Popover de ayuda al pasar el mouse por los íconos ❓
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Derivación segura de estado al cambiar de pestaña
  const [prevRedTeamData, setPrevRedTeamData] = useState(redTeamData);
  if (redTeamData !== prevRedTeamData) {
    setPrevRedTeamData(redTeamData);
    if (redTeamData?.targetUrl !== undefined) setTargetUrl(redTeamData.targetUrl);
    if (redTeamData?.jwtToken !== undefined) setJwtToken(redTeamData.jwtToken);
    if (redTeamData?.enableJwt !== undefined) setEnableJwt(redTeamData.enableJwt);
    if (redTeamData?.enableCors !== undefined) setEnableCors(redTeamData.enableCors);
    if (redTeamData?.result !== undefined) setResult(redTeamData.result);
  }

  const handleUpdateGlobalState = (patch: Partial<RedTeamModuleData>) => {
    if (onUpdateRedTeamData) {
      onUpdateRedTeamData(patch);
    }
  };

  // Cargar Ejemplo Funcional
  const handleLoadExample = () => {
    const exampleUrl = 'http://localhost:3000/api/users';
    const exampleJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    setTargetUrl(exampleUrl);
    setJwtToken(exampleJwt);
    setEnableJwt(true);
    setEnableCors(true);

    handleUpdateGlobalState({
      targetUrl: exampleUrl,
      jwtToken: exampleJwt,
      enableJwt: true,
      enableCors: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await runRedTeamAuditApi({
        targetUrl: targetUrl.trim(),
        jwtToken: jwtToken.trim() || undefined,
        enableJwtScanner: enableJwt,
        enableCorsExploiter: enableCors,
        enablePhishingSimulator: false,
      });

      const auditResult = data as RedTeamAuditResult;
      setResult(auditResult);
      handleUpdateGlobalState({ result: auditResult });
    } catch (err) {
      alert(`Error al auditar Red Team: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSingleReport = async () => {
    if (!result) return;
    try {
      await exportSingleRecordApi({
        moduleType: 'redteam',
        recordData: {
          id: result.runId || `redteam-${Date.now()}`,
          targetUrl,
          jwtToken: jwtToken || null,
          jwtFindings: result.jwtFindings || [],
          corsFindings: result.corsFindings || [],
          phishingSimulatedCount: result.phishingSimulatedCount || 0,
          aiSummary: result.aiSummary,
          createdAt: new Date().toISOString(),
        },
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar reporte individual: ${(err as Error).message}`);
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
            ⚔️ Red Team & Simulación de Infiltración
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Pruebas de explotación activa: manipulación de firmas JWT, mala configuración de CORS y ataques simulados.
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
            Red Team Simulation
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'rgba(9, 9, 11, 0.6)', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
            URL Endpoint Objetivo:
            {renderHelpIcon('url', 'Ingresa la ruta completa de la API o servicio objetivo a auditar (ej: http://localhost:3000/api/users).')}
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => {
              setTargetUrl(e.target.value);
              handleUpdateGlobalState({ targetUrl: e.target.value });
            }}
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

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
            Token JWT Objetivo — <em style={{ color: '#94a3b8', fontWeight: 'normal', marginLeft: '4px' }}>Opcional</em>
            {renderHelpIcon('jwt', 'Pega un token Bearer para testear firmas nulas (alg: none), secrets débiles o alteración de claims.')}
          </label>
          <textarea
            value={jwtToken}
            onChange={(e) => {
              setJwtToken(e.target.value);
              handleUpdateGlobalState({ jwtToken: e.target.value });
            }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            rows={3}
            disabled={loading}
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

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableJwt}
              onChange={(e) => {
                setEnableJwt(e.target.checked);
                handleUpdateGlobalState({ enableJwt: e.target.checked });
              }}
              disabled={loading}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>Escáner de Vulnerabilidades JWT</span>
            {renderHelpIcon('enableJwt', 'Ejecuta falsificación de firmas y pruebas de revocación sobre el token.')}
          </label>

          <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableCors}
              onChange={(e) => {
                setEnableCors(e.target.checked);
                handleUpdateGlobalState({ enableCors: e.target.checked });
              }}
              disabled={loading}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>Explotación CORS Misconfiguration</span>
            {renderHelpIcon('enableCors', 'Pone a prueba orígenes no autorizados y credenciales compartidas en los encabezados CORS.')}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !targetUrl.trim()}
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
            cursor: loading || !targetUrl.trim() ? 'wait' : 'pointer',
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
              <span>Explotando vulnerabilidades y ejecutando ráfagas Red Team...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>Iniciar Ataque Red Team</span>
            </>
          )}
        </button>
      </form>

      {/* RESULTADOS OBTENIDOS */}
      {result && (
        <div style={{ marginTop: '28px', background: 'rgba(9, 9, 11, 0.6)', padding: '24px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ color: '#38bdf8', margin: 0, fontSize: '1.1rem' }}>📊 Resultados del Análisis Red Team</h3>
            <button
              type="button"
              onClick={handleExportSingleReport}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#fff',
                border: '1px solid #38bdf8',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
              }}
            >
              📥 Exportar Informe HTML / PDF
            </button>
          </div>

          {result.aiSummary && (
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '20px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px', fontSize: '0.9rem' }}>
                🤖 Diagnóstico de Explotación IA (Gemini)
              </div>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {result.aiSummary.summary}
              </p>
            </div>
          )}

          {/* VULNERABILIDADES JWT */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
            <h4 style={{ color: '#f8fafc', margin: '0 0 14px 0', fontSize: '0.95rem' }}>🔑 Vulnerabilidades JWT ({result.jwtFindings?.length || 0}):</h4>
            {result.jwtFindings?.length === 0 ? (
              <div style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                ✅ No se encontraron vulnerabilidades JWT explotables.
              </div>
            ) : (
              result.jwtFindings?.map((f: JwtFindingItem, idx: number) => (
                <div key={idx} style={{ background: 'rgba(9, 9, 11, 0.7)', padding: '14px 16px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #ef4444', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span style={{ color: '#ef4444' }}>[{f.vulnerabilityType}]</span>
                    <span style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', border: '1px solid #ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{f.severity}</span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 6px 0', lineHeight: '1.5' }}>{f.description}</p>
                  <div style={{ color: '#4ade80', fontSize: '0.82rem', marginTop: '6px' }}>
                    <strong>Remediación:</strong> {f.remediation}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* MALAS CONFIGURACIONES CORS */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ color: '#f8fafc', margin: '0 0 14px 0', fontSize: '0.95rem' }}>🌐 Malas Configuraciones CORS ({result.corsFindings?.length || 0}):</h4>
            {result.corsFindings?.length === 0 ? (
              <div style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                ✅ Las políticas CORS son estrictamente seguras.
              </div>
            ) : (
              result.corsFindings?.map((f: CorsFindingItem, idx: number) => (
                <div key={idx} style={{ background: 'rgba(9, 9, 11, 0.7)', padding: '14px 16px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #f97316', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span style={{ color: '#f97316' }}>[{f.vulnerabilityType}] Origen Explotado: {f.testedOrigin}</span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 6px 0', lineHeight: '1.5' }}>{f.description}</p>
                  <div style={{ color: '#4ade80', fontSize: '0.82rem', marginTop: '6px' }}>
                    <strong>Remediación:</strong> {f.remediation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};