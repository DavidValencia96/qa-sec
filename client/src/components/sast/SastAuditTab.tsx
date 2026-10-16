import React, { useState } from 'react';
import type { SastAnalysisResponse } from './sast.types';
import { CodeSnippetEditor } from './CodeSnippetEditor';
import { SastFindingsTable } from './SastFindingsTable';
import { SastDiffModal } from './SastDiffModal';
import { analyzeSastContentApi } from '../../services/api.client';

export const SastAuditTab: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SastAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('snippet.ts');
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

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
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#09090b', padding: '24px', borderRadius: '8px', border: '1px solid #27272a' }}>
      <h2 style={{ marginTop: 0, color: '#38bdf8' }}>🛡️ Auditoría de Código Estático (SAST & Secret Scanning)</h2>
      <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '16px' }}>
        Inspecciona fragmentos de código, archivos `.env` y `package.json` en busca de credenciales expuestas, vulnerabilidades de código y dependencias de riesgo.
      </p>

      <CodeSnippetEditor onAnalyze={handleAnalyze} disabled={loading} />

      {loading && <p style={{ color: '#60a5fa', marginTop: '16px' }}>🔄 Ejecutando motores de escaneo regex, dep-checker y análisis IA con Gemini...</p>}
      {error && <p style={{ color: '#f87171', marginTop: '16px' }}>⚠️ Error: {error}</p>}

      {result && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Salud de Código:</span>
                <h1 style={{ margin: 0, color: result.score >= 80 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444' }}>
                  {result.score} / 100
                </h1>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Hallazgos:</span>
                <h2 style={{ margin: 0, color: '#f4f4f5' }}>{result.totalFindings}</h2>
              </div>
            </div>

            {result.remediatedCode && (
              <button
                onClick={() => setShowDiffModal(true)}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ✨ Ver Código Refactorizado por IA
              </button>
            )}
          </div>

          <SastFindingsTable findings={result.findings} />
        </div>
      )}

      {showDiffModal && result?.remediatedCode && (
        <SastDiffModal
          remediatedCode={result.remediatedCode}
          fileName={activeFileName}
          onClose={() => setShowDiffModal(false)}
        />
      )}
    </div>
  );
};