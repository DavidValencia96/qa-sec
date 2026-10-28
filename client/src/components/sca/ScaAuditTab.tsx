import React, { useState } from 'react';
import {
  runScaAuditApi,
  exportSingleRecordApi,
  type ScaAuditResponse,
  type DependencyManifestType,
  type ScaVulnerabilityItem,
  type GitSecretFindingItem,
} from '../../services/api.client';
import { ModuleGuard } from '../auth/ModuleGuard';

export interface ScaModuleData {
  manifestType: DependencyManifestType;
  manifestContent: string;
  enableDependencyScan: boolean;
  enableGitHistoryScan: boolean;
  auditResult: ScaAuditResponse | null;
}

interface ScaAuditTabProps {
  scaData?: ScaModuleData;
  onUpdateScaData?: (data: Partial<ScaModuleData>) => void;
}

export const ScaAuditTab: React.FC<ScaAuditTabProps> = ({
  scaData,
  onUpdateScaData,
}) => {
  const [manifestType, setManifestType] = useState<DependencyManifestType>(
    scaData?.manifestType || 'package_json'
  );
  const [manifestContent, setManifestContent] = useState<string>(
    scaData?.manifestContent || ''
  );
  const [enableDependencyScan, setEnableDependencyScan] = useState<boolean>(
    scaData?.enableDependencyScan ?? true
  );
  const [enableGitHistoryScan, setEnableGitHistoryScan] = useState<boolean>(
    scaData?.enableGitHistoryScan ?? true
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<ScaAuditResponse | null>(
    scaData?.auditResult || null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [prevScaData, setPrevScaData] = useState(scaData);
  if (scaData !== prevScaData) {
    setPrevScaData(scaData);
    if (scaData?.manifestType !== undefined) setManifestType(scaData.manifestType);
    if (scaData?.manifestContent !== undefined) setManifestContent(scaData.manifestContent);
    if (scaData?.enableDependencyScan !== undefined) setEnableDependencyScan(scaData.enableDependencyScan);
    if (scaData?.enableGitHistoryScan !== undefined) setEnableGitHistoryScan(scaData.enableGitHistoryScan);
    if (scaData?.auditResult !== undefined) setAuditResult(scaData.auditResult);
  }

  const handleUpdateGlobalState = (patch: Partial<ScaModuleData>) => {
    if (onUpdateScaData) {
      onUpdateScaData(patch);
    }
  };

  const handleLoadExample = () => {
    const exampleManifest = JSON.stringify(
      {
        name: 'qa-sec-demo-app',
        version: '1.0.0',
        dependencies: {
          express: '3.0.0',
          lodash: '4.17.11',
          jsonwebtoken: '8.5.1',
          axios: '0.21.1',
        },
        devDependencies: {
          nodemon: '2.0.4',
        },
      },
      null,
      2
    );

    setManifestType('package_json');
    setManifestContent(exampleManifest);
    setEnableDependencyScan(true);
    setEnableGitHistoryScan(true);

    handleUpdateGlobalState({
      manifestType: 'package_json',
      manifestContent: exampleManifest,
      enableDependencyScan: true,
      enableGitHistoryScan: true,
    });
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestContent.trim() || loading) return;

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

      if (data && data.success) {
        setAuditResult(data);
        handleUpdateGlobalState({ auditResult: data });
      } else {
        setErrorMessage(data?.error || 'Fallo durante el análisis de la cadena de suministro.');
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
    <ModuleGuard moduleKey="SCA" moduleTitle="Seguridad de Dependencias (SCA & Git Secrets)">
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
              🔒 SCA & Supply Chain Security (Software Composition Analysis)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
              Inspecciona archivos de manifiesto (`package.json`, `requirements.txt`, `pom.xml`) en busca de vulnerabilidades conocidas (CVE) en paquetes de terceros y fuga de secretos en historial Git.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
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
              SCA & Supply Chain
            </span>
          </div>
        </div>

        <form onSubmit={handleRunAudit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Tipo de Archivo / Manifest de Dependencias
              {renderHelpIcon('manifestType', 'Selecciona el gestor de paquetes de tu proyecto para aplicar los patrones de escaneo correspondientes.')}
            </label>
            <select
              value={manifestType}
              onChange={(e) => {
                const val = e.target.value as DependencyManifestType;
                setManifestType(val);
                handleUpdateGlobalState({ manifestType: val });
              }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#38bdf8',
                fontSize: '0.88rem',
                fontWeight: 'bold',
                outline: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <option value="package_json">Node.js (package.json)</option>
              <option value="requirements_txt">Python (requirements.txt)</option>
              <option value="pom_xml">Java (pom.xml)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Contenido del Manifest / Código para Escaneo Git
              {renderHelpIcon('manifestContent', 'Pega el texto plano o JSON de tu archivo de dependencias para auditar sus librerías e identificadores de vulnerabilidades.')}
            </label>
            <textarea
              rows={8}
              value={manifestContent}
              onChange={(e) => {
                setManifestContent(e.target.value);
                handleUpdateGlobalState({ manifestContent: e.target.value });
              }}
              placeholder={'{\n  "dependencies": {\n    "express": "3.0.0",\n    "lodash": "4.17.11"\n  }\n}'}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                background: 'rgba(9, 9, 11, 0.7)',
                color: '#38bdf8',
                fontSize: '0.88rem',
                fontFamily: 'Consolas, Monaco, monospace',
                lineHeight: '1.5',
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
                checked={enableDependencyScan}
                onChange={(e) => {
                  setEnableDependencyScan(e.target.checked);
                  handleUpdateGlobalState({ enableDependencyScan: e.target.checked });
                }}
                disabled={loading}
                style={{ accentColor: '#38bdf8' }}
              />
              <span>Auditoría de Dependencias Vulnerables (SCA)</span>
              {renderHelpIcon('depScan', 'Analiza cada librería registrada buscando registros de vulnerabilidades de seguridad publicadas.')}
            </label>

            <label style={{ color: '#e2e8f0', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={enableGitHistoryScan}
                onChange={(e) => {
                  setEnableGitHistoryScan(e.target.checked);
                  handleUpdateGlobalState({ enableGitHistoryScan: e.target.checked });
                }}
                disabled={loading}
                style={{ accentColor: '#38bdf8' }}
              />
              <span>Detección de Secretos en Historial Git</span>
              {renderHelpIcon('gitSecrets', 'Busca claves API, Tokens y credenciales filtradas accidentalmente en los commits.')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !manifestContent.trim()}
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
              cursor: loading || !manifestContent.trim() ? 'wait' : 'pointer',
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
                <span>Analizando dependencias y credenciales expuestas...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Ejecutar Análisis SCA & Git Secrets</span>
              </>
            )}
          </button>
        </form>

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
            ⚠️ <strong>Error SCA:</strong> {errorMessage}
          </div>
        )}

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
                📊 Resultados del Análisis SCA (ID: {auditResult.runId})
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
                📄 Exportar Informe SCA (HTML)
              </button>
            </div>

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

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#f4f4f5', marginBottom: '14px', fontSize: '0.95rem' }}>
                📦 Vulnerabilidades en Dependencias ({auditResult.vulnerabilities.length})
              </div>

              {auditResult.vulnerabilities.length === 0 ? (
                <div style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  ✅ No se detectaron vulnerabilidades conocidas en las dependencias auditadas.
                </div>
              ) : (
                auditResult.vulnerabilities.map((vuln: ScaVulnerabilityItem, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(9, 9, 11, 0.7)',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${vuln.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                      <span>{vuln.packageName} <span style={{ color: '#38bdf8' }}>(v{vuln.currentVersion})</span> {vuln.cveId ? `— ${vuln.cveId}` : ''}</span>
                      <span
                        style={{
                          background: vuln.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.25)',
                          color: vuln.severity === 'CRITICAL' ? '#f87171' : '#fb923c',
                          border: `1px solid ${vuln.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {vuln.severity}
                      </span>
                    </div>

                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                      {vuln.description}
                    </p>

                    {vuln.patchedVersion && (
                      <div style={{ color: '#4ade80', fontSize: '0.82rem', marginTop: '6px' }}>
                        <strong>💡 Versión Sugerida Parcheada:</strong> {vuln.patchedVersion}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#f4f4f5', marginBottom: '14px', fontSize: '0.95rem' }}>
                🔑 Secretos & Credenciales Expuestas ({auditResult.gitSecrets.length})
              </div>

              {auditResult.gitSecrets.length === 0 ? (
                <div style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  ✅ No se detectaron patrones de API Keys ni credenciales expuestas en el análisis.
                </div>
              ) : (
                auditResult.gitSecrets.map((secret: GitSecretFindingItem, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(9, 9, 11, 0.7)',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #ef4444',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                      <span>[{secret.secretType}] {secret.filePath}</span>
                      <span style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        CRITICAL
                      </span>
                    </div>

                    <div style={{ fontFamily: 'Consolas, Monaco, monospace', background: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: '6px', color: '#f87171', fontSize: '0.82rem', wordBreak: 'break-all', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      Patrón Detectado: {secret.matchedPattern}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </ModuleGuard>
  );
};