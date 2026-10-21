import React, { useState } from 'react';
import { runDastAuditApi, exportSingleRecordApi, type DastAuditResponse, type DastFindingItem } from '../../services/api.client';

export interface DastModuleData {
  targetBaseUrl: string;
  openApiSpecJson: string;
  primaryAuthHeader: string;
  secondaryAuthHeader: string;
  enableBolaTesting: boolean;
  enableHeaderInjectionTesting: boolean;
  auditResult: DastAuditResponse | null;
}

interface DastAuditTabProps {
  dastData?: DastModuleData;
  onUpdateDastData?: (data: Partial<DastModuleData>) => void;
}

export const DastAuditTab: React.FC<DastAuditTabProps> = ({
  dastData,
  onUpdateDastData,
}) => {
  const [targetBaseUrl, setTargetBaseUrl] = useState<string>(
    dastData?.targetBaseUrl || 'http://localhost:3000/api'
  );
  const [openApiSpecJson, setOpenApiSpecJson] = useState<string>(
    dastData?.openApiSpecJson || ''
  );
  const [primaryAuthHeader, setPrimaryAuthHeader] = useState<string>(
    dastData?.primaryAuthHeader || ''
  );
  const [secondaryAuthHeader, setSecondaryAuthHeader] = useState<string>(
    dastData?.secondaryAuthHeader || ''
  );
  const [enableBolaTesting, setEnableBolaTesting] = useState<boolean>(
    dastData?.enableBolaTesting ?? true
  );
  const [enableHeaderInjectionTesting, setEnableHeaderInjectionTesting] = useState<boolean>(
    dastData?.enableHeaderInjectionTesting ?? true
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<DastAuditResponse | null>(
    dastData?.auditResult || null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Popover de ayuda al pasar el mouse por los íconos ❓
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Sincronización derivando estado de props al navegar entre pestañas
  const [prevDastData, setPrevDastData] = useState(dastData);
  if (dastData !== prevDastData) {
    setPrevDastData(dastData);
    if (dastData?.targetBaseUrl !== undefined) setTargetBaseUrl(dastData.targetBaseUrl);
    if (dastData?.openApiSpecJson !== undefined) setOpenApiSpecJson(dastData.openApiSpecJson);
    if (dastData?.primaryAuthHeader !== undefined) setPrimaryAuthHeader(dastData.primaryAuthHeader);
    if (dastData?.secondaryAuthHeader !== undefined) setSecondaryAuthHeader(dastData.secondaryAuthHeader);
    if (dastData?.enableBolaTesting !== undefined) setEnableBolaTesting(dastData.enableBolaTesting);
    if (dastData?.enableHeaderInjectionTesting !== undefined) setEnableHeaderInjectionTesting(dastData.enableHeaderInjectionTesting);
    if (dastData?.auditResult !== undefined) setAuditResult(dastData.auditResult);
  }

  const handleUpdateGlobalState = (patch: Partial<DastModuleData>) => {
    if (onUpdateDastData) {
      onUpdateDastData(patch);
    }
  };

  // Cargar Ejemplo Funcional en los campos
  const handleLoadExample = () => {
    const exampleUrl = 'http://localhost:3000/api';
    const exampleSpec = JSON.stringify(
      {
        openapi: '3.0.0',
        info: { title: 'QA-SEC Test API', version: '1.0.0' },
        paths: {
          '/users/{id}': {
            get: {
              summary: 'Obtener perfil de usuario por ID',
              parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
              responses: { '200': { description: 'OK' } },
            },
          },
          '/admin/secrets': {
            get: {
              summary: 'Ruta administrativa sensible',
              responses: { '403': { description: 'Forbidden' } },
            },
          },
        },
      },
      null,
      2
    );
    const exampleToken1 = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user1';
    const exampleToken2 = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user2';

    setTargetBaseUrl(exampleUrl);
    setOpenApiSpecJson(exampleSpec);
    setPrimaryAuthHeader(exampleToken1);
    setSecondaryAuthHeader(exampleToken2);
    setEnableBolaTesting(true);
    setEnableHeaderInjectionTesting(true);

    handleUpdateGlobalState({
      targetBaseUrl: exampleUrl,
      openApiSpecJson: exampleSpec,
      primaryAuthHeader: exampleToken1,
      secondaryAuthHeader: exampleToken2,
      enableBolaTesting: true,
      enableHeaderInjectionTesting: true,
    });
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBaseUrl.trim() || loading) return;

    setLoading(true);
    setErrorMessage(null);
    setAuditResult(null);

    try {
      const data = await runDastAuditApi({
        targetBaseUrl,
        openApiSpecJson: openApiSpecJson.trim() || undefined,
        primaryAuthHeader: primaryAuthHeader.trim() || undefined,
        secondaryAuthHeader: secondaryAuthHeader.trim() || undefined,
        enableBolaTesting,
        enableHeaderInjectionTesting,
      });

      if (data && data.success) {
        setAuditResult(data);
        handleUpdateGlobalState({ auditResult: data });
      } else {
        setErrorMessage(data?.error || 'Ocurrió un fallo no especificado durante la ejecución DAST.');
      }
    } catch (err) {
      setErrorMessage(`Error de conexión con el backend: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSingleReport = async () => {
    if (!auditResult) return;
    try {
      await exportSingleRecordApi({
        moduleType: 'dast',
        recordData: {
          id: auditResult.runId,
          targetBaseUrl,
          totalTestedEndpoints: auditResult.totalTestedEndpoints,
          findings: auditResult.findings,
          aiSummary: auditResult.aiSummary,
          createdAt: new Date().toISOString(),
        },
        format: 'html',
      });
    } catch (err) {
      setErrorMessage(`Error al exportar informe DAST: ${(err as Error).message}`);
    }
  };

  // Renderizador de Popover flotante de ayuda
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
            🛡️ DAST & Dynamic OpenAPI Fuzzer
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Ejecuta pruebas dinámicas automatizadas sobre endpoints OpenAPI/Swagger. Detecta vulnerabilidades BOLA/IDOR (OWASP API1) e inyecciones de cabeceras en tiempo de ejecución.
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
            DAST & API Security
          </span>
        </div>
      </div>

      <form onSubmit={handleRunAudit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
            URL Base de la API Target
            {renderHelpIcon('url', 'Ingresa el dominio o endpoint base de la API a probar (ej: http://localhost:3000/api).')}
          </label>
          <input
            type="url"
            value={targetBaseUrl}
            onChange={(e) => {
              setTargetBaseUrl(e.target.value);
              handleUpdateGlobalState({ targetBaseUrl: e.target.value });
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
            Especificación OpenAPI / Swagger (JSON String) — <em style={{ color: '#94a3b8', fontWeight: 'normal', marginLeft: '4px' }}>Opcional</em>
            {renderHelpIcon('openapi', 'Pega el esquema OpenAPI 3.0 en JSON para que el fuzzer descubra automáticamente todos los endpoints y parámetros.')}
          </label>
          <textarea
            rows={4}
            value={openApiSpecJson}
            onChange={(e) => {
              setOpenApiSpecJson(e.target.value);
              handleUpdateGlobalState({ openApiSpecJson: e.target.value });
            }}
            placeholder='{"openapi": "3.0.0", "paths": { "/users/{id}": { "get": {...} } }}'
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Token Usuario 1 (Primary Auth)
              {renderHelpIcon('token1', 'Token JWT o cabecera Bearer del usuario legítimo que realiza la petición.')}
            </label>
            <input
              type="text"
              value={primaryAuthHeader}
              onChange={(e) => {
                setPrimaryAuthHeader(e.target.value);
                handleUpdateGlobalState({ primaryAuthHeader: e.target.value });
              }}
              placeholder="Bearer token_user_1"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Token Usuario 2 (Secondary Auth para BOLA)
              {renderHelpIcon('token2', 'Token JWT de un segundo usuario para verificar si puede acceder a los recursos del Usuario 1 (Broken Object Level Authorization).')}
            </label>
            <input
              type="text"
              value={secondaryAuthHeader}
              onChange={(e) => {
                setSecondaryAuthHeader(e.target.value);
                handleUpdateGlobalState({ secondaryAuthHeader: e.target.value });
              }}
              placeholder="Bearer token_user_2"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableBolaTesting}
              onChange={(e) => {
                setEnableBolaTesting(e.target.checked);
                handleUpdateGlobalState({ enableBolaTesting: e.target.checked });
              }}
              disabled={loading}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>Pruebas de BOLA / IDOR (OWASP API1)</span>
          </label>

          <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={enableHeaderInjectionTesting}
              onChange={(e) => {
                setEnableHeaderInjectionTesting(e.target.checked);
                handleUpdateGlobalState({ enableHeaderInjectionTesting: e.target.checked });
              }}
              disabled={loading}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>Inyección de Cabeceras (Host & CRLF)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !targetBaseUrl.trim()}
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
            cursor: loading || !targetBaseUrl.trim() ? 'wait' : 'pointer',
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
              <span>Inyectando vectores DAST y evaluando OpenAPI...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Iniciar Fuzzing DAST & BOLA</span>
            </>
          )}
        </button>
      </form>

      {/* MENSAJE DE ERROR */}
      {errorMessage && (
        <div
          style={{
            marginTop: '20px',
            padding: '14px 18px',
            borderRadius: '8px',
            background: 'rgba(127, 29, 29, 0.3)',
            border: '1px solid #ef4444',
            color: '#f87171',
            fontSize: '0.9rem',
          }}
        >
          ⚠️ <strong>Error DAST:</strong> {errorMessage}
        </div>
      )}

      {/* RESULTADOS OBTENIDOS */}
      {auditResult && (
        <div
          style={{
            marginTop: '28px',
            background: 'rgba(9, 9, 11, 0.6)',
            padding: '24px',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>
              📊 Resultados de la Auditoría DAST (ID: {auditResult.runId})
            </h4>
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
              📄 Exportar Informe DAST (HTML)
            </button>
          </div>

          {/* SÍNTESIS IA */}
          {auditResult.aiSummary && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #38bdf8',
                marginBottom: '20px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px', fontSize: '0.9rem' }}>
                🤖 Diagnóstico Ejecutivo Gemini AI
              </div>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {auditResult.aiSummary.summary}
              </p>
            </div>
          )}

          {/* RESUMEN DE HALLAZGOS */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#f4f4f5', marginBottom: '14px', fontSize: '0.95rem' }}>
              🔍 Hallazgos Identificados ({auditResult.findings.length})
            </div>

            {auditResult.findings.length === 0 ? (
              <div style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                ✅ No se detectaron vulnerabilidades dinámicas de BOLA ni inyecciones de cabeceras en los endpoints evaluados.
              </div>
            ) : (
              auditResult.findings.map((finding: DastFindingItem, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(9, 9, 11, 0.7)',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${finding.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <span>[{finding.vulnerabilityType}] {finding.httpMethod} {finding.endpointPath}</span>
                    <span
                      style={{
                        background: finding.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.25)',
                        color: finding.severity === 'CRITICAL' ? '#f87171' : '#fb923c',
                        border: `1px solid ${finding.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                    {finding.description}
                  </p>

                  <div style={{ fontFamily: 'Consolas, Monaco, monospace', background: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: '6px', color: '#38bdf8', fontSize: '0.82rem', wordBreak: 'break-all', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    Evidencia: {finding.evidencePayload}
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