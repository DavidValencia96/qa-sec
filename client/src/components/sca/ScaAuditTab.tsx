import React, { useState } from 'react';
import { runScaAuditApi, exportSingleRecordApi, type ScaAuditResponse } from '../../services/api.client';
import type { DependencyManifestType } from '../../services/api.client';

export const ScaAuditTab: React.FC = () => {
  const [manifestType, setManifestType] = useState<DependencyManifestType>('package_json');
  const [manifestContent, setManifestContent] = useState('');
  const [enableDependencyScan, setEnableDependencyScan] = useState(true);
  const [enableGitHistoryScan, setEnableGitHistoryScan] = useState(true);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<ScaAuditResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestContent.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setAuditResult(null);

    try {
      const data = await runScaAuditApi({
        manifestType,
        manifestContent,
        enableDependencyScan,
        enableGitHistoryScan,
      });

      if (data.success) {
        setAuditResult(data);
      } else {
        setErrorMessage(data.error || 'Fallo durante el análisis de la cadena de suministro.');
      }
    } catch (err) {
      setErrorMessage(`Error de conexión: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSingleReport = async () => {
    if (!auditResult) return;
    try {
      await exportSingleRecordApi({
        moduleType: 'sca',
        recordData: {
          id: auditResult.runId,
          manifestType,
          totalDependenciesAudited: auditResult.totalDependenciesAudited,
          vulnerabilities: auditResult.vulnerabilities,
          gitSecrets: auditResult.gitSecrets,
          aiSummary: auditResult.aiSummary,
          createdAt: new Date().toISOString(),
        },
        format: 'html',
      });
    } catch (err) {
      setErrorMessage(`Error al exportar informe SCA: ${(err as Error).message}`);
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
        🔐 SCA & Supply Chain Security (Software Composition Analysis)
      </h3>

      <form onSubmit={handleRunAudit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
            Tipo de Archivo / Manifest de Dependencias
          </label>
          <select
            value={manifestType}
            onChange={(e) => setManifestType(e.target.value as DependencyManifestType)}
            disabled={loading}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#09090b', color: '#fff', border: '1px solid #3f3f46' }}
          >
            <option value="package_json">Node.js (package.json)</option>
            <option value="requirements_txt">Python (requirements.txt)</option>
            <option value="pom_xml">Java (pom.xml)</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
            Contenido del Manifest / Código para Escaneo Git
          </label>
          <textarea
            rows={8}
            value={manifestContent}
            onChange={(e) => setManifestContent(e.target.value)}
            placeholder={'{\n  "dependencies": {\n    "express": "3.0.0",\n    "lodash": "4.17.11"\n  }\n}'}
            required
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#09090b', color: '#86efac', border: '1px solid #3f3f46', fontFamily: 'monospace', fontSize: '0.88rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <label style={{ color: '#e4e4e7', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={enableDependencyScan} onChange={(e) => setEnableDependencyScan(e.target.checked)} disabled={loading} />
            Auditoría de Dependencias Vulnerables (SCA)
          </label>

          <label style={{ color: '#e4e4e7', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={enableGitHistoryScan} onChange={(e) => setEnableGitHistoryScan(e.target.checked)} disabled={loading} />
            Detección de Secretos en Historial Git
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !manifestContent.trim()}
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
              Analizando dependencias y credenciales expuestas...
            </>
          ) : (
            '🔍 Ejecutar Análisis SCA & Git Secrets'
          )}
        </button>
      </form>

      {errorMessage && (
        <div style={{ marginTop: '20px', padding: '14px', borderRadius: '6px', background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', fontSize: '0.9rem' }}>
          ⚠️ <strong>Error SCA:</strong> {errorMessage}
        </div>
      )}

      {auditResult && (
        <div style={{ marginTop: '28px', background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>
              📊 Resultados del Análisis SCA (ID: {auditResult.runId})
            </h4>
            <button
              type="button"
              onClick={handleExportSingleReport}
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              📄 Exportar Informe SCA (HTML)
            </button>
          </div>

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

          {/* VULNERABILIDADES DE DEPENDENCIAS */}
          <div style={{ background: '#18181b', padding: '16px', borderRadius: '6px', border: '1px solid #27272a', marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', color: '#f4f4f5', marginBottom: '12px' }}>
              📦 Vulnerabilidades en Dependencias ({auditResult.vulnerabilities.length})
            </div>

            {auditResult.vulnerabilities.length === 0 ? (
              <div style={{ color: '#4ade80', fontSize: '0.9rem', fontStyle: 'italic' }}>
                ✅ No se detectaron vulnerabilidades conocidas en las dependencias auditadas.
              </div>
            ) : (
              auditResult.vulnerabilities.map((vuln, idx) => (
                <div key={idx} style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: `4px solid ${vuln.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`, marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                    <span>{vuln.packageName} (v{vuln.currentVersion}) {vuln.cveId ? `— ${vuln.cveId}` : ''}</span>
                    <span style={{ color: vuln.severity === 'CRITICAL' ? '#ef4444' : '#f97316' }}>{vuln.severity}</span>
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>{vuln.description}</div>
                  {vuln.patchedVersion && (
                    <div style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      💡 Versión Sugerida Parcheada: {vuln.patchedVersion}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* SECRETOS EN HISTORIAL GIT */}
          <div style={{ background: '#18181b', padding: '16px', borderRadius: '6px', border: '1px solid #27272a' }}>
            <div style={{ fontWeight: 'bold', color: '#f4f4f5', marginBottom: '12px' }}>
              🔑 Secretos & Credenciales Expuestas ({auditResult.gitSecrets.length})
            </div>

            {auditResult.gitSecrets.length === 0 ? (
              <div style={{ color: '#4ade80', fontSize: '0.9rem', fontStyle: 'italic' }}>
                ✅ No se detectaron patrones de API Keys ni credenciales expuestas en el análisis.
              </div>
            ) : (
              auditResult.gitSecrets.map((secret, idx) => (
                <div key={idx} style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #ef4444', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                    <span>[{secret.secretType}] {secret.filePath}</span>
                    <span style={{ color: '#ef4444' }}>CRITICAL</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', background: '#18181b', padding: '6px 10px', borderRadius: '4px', color: '#fca5a5', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    Patrón Detectado: {secret.matchedPattern}
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