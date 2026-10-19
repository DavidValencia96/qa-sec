import React, { useState } from 'react';
import { runDastAuditApi, exportSingleRecordApi, type DastAuditResponse } from '../../services/api.client';

export const DastAuditTab: React.FC = () => {
  const [targetBaseUrl, setTargetBaseUrl] = useState('http://localhost:3000/api');
  const [openApiSpecJson, setOpenApiSpecJson] = useState('');
  const [primaryAuthHeader, setPrimaryAuthHeader] = useState('');
  const [secondaryAuthHeader, setSecondaryAuthHeader] = useState('');
  const [enableBolaTesting, setEnableBolaTesting] = useState(true);
  const [enableHeaderInjectionTesting, setEnableHeaderInjectionTesting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<DastAuditResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (data.success) {
        setAuditResult(data);
      } else {
        setErrorMessage(data.error || 'Ocurrió un fallo no especificado durante la ejecución DAST.');
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

  return (
    <div style={{ background: '#18181b', padding: '24px', borderRadius: '8px', border: '1px solid #27272a' }}>
      <style>{`
        @keyframes spinner-rotator {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <h3 style={{ color: '#f4f4f5', margin: '0 0 16px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🛡️ DAST & Dynamic OpenAPI Fuzzer
      </h3>

      <form onSubmit={handleRunAudit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>URL Base de la API Target</label>
          <input
            type="url"
            value={targetBaseUrl}
            onChange={(e) => setTargetBaseUrl(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
            Especificación OpenAPI / Swagger (JSON String) — <em>Opcional</em>
          </label>
          <textarea
            rows={4}
            value={openApiSpecJson}
            onChange={(e) => setOpenApiSpecJson(e.target.value)}
            placeholder='{"openapi": "3.0.0", "paths": { "/users/{id}": { "get": {...} } }}'
            disabled={loading}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#09090b', color: '#38bdf8', border: '1px solid #3f3f46', fontFamily: 'monospace', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Token Usuario 1 (Primary Auth)</label>
            <input
              type="text"
              value={primaryAuthHeader}
              onChange={(e) => setPrimaryAuthHeader(e.target.value)}
              placeholder="Bearer token_user_1"
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Token Usuario 2 (Secondary Auth para BOLA)</label>
            <input
              type="text"
              value={secondaryAuthHeader}
              onChange={(e) => setSecondaryAuthHeader(e.target.value)}
              placeholder="Bearer token_user_2"
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <label style={{ color: '#e4e4e7', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={enableBolaTesting} onChange={(e) => setEnableBolaTesting(e.target.checked)} disabled={loading} />
            Pruebas de BOLA / IDOR (OWASP API1)
          </label>

          <label style={{ color: '#e4e4e7', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={enableHeaderInjectionTesting} onChange={(e) => setEnableHeaderInjectionTesting(e.target.checked)} disabled={loading} />
            Inyección de Cabeceras (Host & CRLF)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            background: loading ? '#27272a' : '#2563eb',
            color: loading ? '#38bdf8' : '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? (
            <>
              <span style={{ width: '18px', height: '18px', border: '3px solid rgba(56, 189, 248, 0.3)', borderTop: '3px solid #38bdf8', borderRadius: '50%', animation: 'spinner-rotator 0.8s linear infinite', display: 'inline-block' }} />
              Inyectando vectores DAST y evaluando OpenAPI...
            </>
          ) : (
            '⚡ Iniciar Fuzzing DAST & BOLA'
          )}
        </button>
      </form>

      {/* MENSAJE DE ERROR */}
      {errorMessage && (
        <div style={{ marginTop: '20px', padding: '14px', borderRadius: '6px', background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', fontSize: '0.9rem' }}>
          ⚠️ <strong>Error DAST:</strong> {errorMessage}
        </div>
      )}

      {/* VISTA EN PANTALLA DE RESULTADOS OBTENIDOS */}
      {auditResult && (
        <div style={{ marginTop: '28px', background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>
              📊 Resultados de la Auditoría DAST (ID: {auditResult.runId})
            </h4>
            <button
              type="button"
              onClick={handleExportSingleReport}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              📄 Exportar Informe DAST (HTML)
            </button>
          </div>

          {/* SÍNTESIS IA */}
          {auditResult.aiSummary && (
            <div style={{ background: '#18181b', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #38bdf8', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px', fontSize: '0.9rem' }}>
                🤖 Diagnóstico Ejecutivo Gemini AI
              </div>
              <p style={{ margin: 0, color: '#e4e4e7', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {auditResult.aiSummary.summary}
              </p>
            </div>
          )}

          {/* RESUMEN DE HALLAZGOS */}
          <div style={{ background: '#18181b', padding: '16px', borderRadius: '6px', border: '1px solid #27272a' }}>
            <div style={{ fontWeight: 'bold', color: '#f4f4f5', marginBottom: '12px' }}>
              🔍 Hallazgos Identificados ({auditResult.findings.length})
            </div>

            {auditResult.findings.length === 0 ? (
              <div style={{ color: '#4ade80', fontSize: '0.9rem', fontStyle: 'italic' }}>
                ✅ No se detectaron vulnerabilidades dinámicas de BOLA ni inyecciones de cabeceras en los endpoints evaluados.
              </div>
            ) : (
              auditResult.findings.map((finding, idx) => (
                <div key={idx} style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: `4px solid ${finding.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`, marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                    <span>[{finding.vulnerabilityType}] {finding.httpMethod} {finding.endpointPath}</span>
                    <span style={{ color: finding.severity === 'CRITICAL' ? '#ef4444' : '#f97316' }}>{finding.severity}</span>
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>{finding.description}</div>
                  <div style={{ fontFamily: 'monospace', background: '#18181b', padding: '6px 10px', borderRadius: '4px', color: '#38bdf8', fontSize: '0.8rem', wordBreak: 'break-all' }}>
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