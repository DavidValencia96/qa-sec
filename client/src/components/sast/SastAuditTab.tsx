import React, { useState } from 'react';
import type { SastAnalysisResponse } from './sast.types';
import { CodeSnippetEditor } from './CodeSnippetEditor';
import { SastFindingsTable } from './SastFindingsTable';
import { SastDiffModal } from './SastDiffModal';
import { ReportExportActions } from '../report/ReportExportActions';
import { analyzeSastContentApi } from '../../services/api.client';
import { ModuleGuard } from '../auth/ModuleGuard';

export interface SastModuleData {
  fileName: string;
  result: SastAnalysisResponse | null;
  codeSnippet: string;
  language: string;
  showDiffModal: boolean;
}

interface SastAuditTabProps {
  sastData?: SastModuleData;
  onUpdateSastData?: (data: Partial<SastModuleData>) => void;
}

export const SastAuditTab: React.FC<SastAuditTabProps> = ({ sastData, onUpdateSastData }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SastAnalysisResponse | null>(sastData?.result || null);
  const [error, setError] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>(sastData?.fileName || 'snippet.ts');
  const [showDiffModal, setShowDiffModal] = useState<boolean>(sastData?.showDiffModal || false);

  const [prevSastData, setPrevSastData] = useState(sastData);
  if (sastData !== prevSastData) {
    setPrevSastData(sastData);
    if (sastData?.result !== undefined) setResult(sastData.result);
    if (sastData?.fileName !== undefined) setActiveFileName(sastData.fileName);
    if (sastData?.showDiffModal !== undefined) setShowDiffModal(sastData.showDiffModal);
  }

  const handleAnalyze = async (
    code: string,
    fileName: string,
    fileType: 'code' | 'env' | 'package_json',
    language: string
  ) => {
    setLoading(true);
    setError(null);
    setActiveFileName(fileName);

    try {
      const data = await analyzeSastContentApi({ codeOrContent: code, fileName, fileType, language });
      if (data && data.success) {
        setResult(data);
        if (onUpdateSastData) {
          onUpdateSastData({
            fileName,
            result: data,
            codeSnippet: code,
            language,
          });
        }
      } else {
        setError(data?.error || 'No se pudo realizar el análisis SAST.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getHealthInfo = (score: number) => {
    if (score >= 80) {
      return {
        scoreColor: '#22c55e',
        badgeBg: 'rgba(34, 197, 94, 0.15)',
        badgeColor: '#4ade80',
        badgeBorder: '#22c55e',
        statusText: '🟢 CÓDIGO ACEPTABLE / APTO PARA DESPLIEGUE (Cumple estándar ≥ 80/100)',
        boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
      };
    } else if (score >= 50) {
      return {
        scoreColor: '#eab308',
        badgeBg: 'rgba(234, 179, 8, 0.15)',
        badgeColor: '#facc15',
        badgeBorder: '#eab308',
        statusText: '⚠️ ADVERTENCIA / REQUIERE REVISIÓN (No alcanza el mínimo 80/100)',
        boxShadow: '0 0 15px rgba(234, 179, 8, 0.2)',
      };
    } else {
      return {
        scoreColor: '#ef4444',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        badgeColor: '#f87171',
        badgeBorder: '#ef4444',
        statusText: '🔴 RECHAZADO / RIESGO CRÍTICO (No cumple el estándar mínimo 80/100)',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)',
      };
    }
  };

  return (
    <ModuleGuard moduleKey="SAST" moduleTitle="Análisis Estático (SAST & Secret Scanning)">
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🛡️ Auditoría de Código Estático (SAST & Secret Scanning)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Inspecciona fragmentos de código, archivos `.env` y `package.json` en busca de credenciales expuestas, vulnerabilidades de código y dependencias de riesgo.
            </p>
          </div>

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
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
            }}
          >
            SAST & Secret Security
          </span>
        </div>

        <CodeSnippetEditor
          onAnalyze={handleAnalyze}
          disabled={loading}
          initialCode={sastData?.codeSnippet}
          initialFileName={sastData?.fileName}
          initialLanguage={sastData?.language}
        />

        {loading && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>🔄</span>
            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Ejecutando motores de escaneo regex, dep-checker y análisis IA con Gemini...
            </span>
          </div>
        )}

        {error && (
          <p style={{ color: '#f87171', marginTop: '16px', padding: '14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' }}>
            ⚠️ Error: {error}
          </p>
        )}

        {result && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(() => {
              const health = getHealthInfo(result.score);
              return (
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${health.badgeBorder}`,
                    boxShadow: health.boxShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Salud de Código:
                        </span>
                        <h1 style={{ margin: 0, color: health.scoreColor, fontSize: '2.2rem', fontWeight: '900' }}>
                          {result.score} <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 'normal' }}>/ 100</span>
                        </h1>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Hallazgos:
                        </span>
                        <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.8rem', fontWeight: '800' }}>
                          {result.totalFindings}
                        </h2>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <ReportExportActions
                        title={`Auditoría SAST - ${activeFileName}`}
                        summary={`Auditoría estática de código completada con un puntaje de salud de ${result.score}/100 y un total de ${result.totalFindings} hallazgos.`}
                        score={result.score}
                        findings={result.findings}
                        remediatedCode={result.remediatedCode}
                      />

                      {result.remediatedCode && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowDiffModal(true);
                            if (onUpdateSastData) onUpdateSastData({ showDiffModal: true });
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                            color: '#fff',
                            border: '1px solid #38bdf8',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontWeight: 'bold',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          ✨ Ver Refactorización
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: health.badgeBg,
                      border: `1px solid ${health.badgeBorder}`,
                      padding: '8px 14px',
                      borderRadius: '6px',
                      color: health.badgeColor,
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {health.statusText}
                  </div>
                </div>
              );
            })()}

            <SastFindingsTable findings={result.findings} />
          </div>
        )}

        {showDiffModal && result?.remediatedCode && (
          <SastDiffModal
            remediatedCode={result.remediatedCode}
            fileName={activeFileName}
            onClose={() => {
              setShowDiffModal(false);
              if (onUpdateSastData) onUpdateSastData({ showDiffModal: false });
            }}
          />
        )}
      </div>
    </ModuleGuard>
  );
};