import React, { useEffect, useState } from 'react';
import type { CveItem, CveAiAnalysis } from './cve.types';
import { StackFilterBar } from './StackFilterBar';
import { CveAiSummaryModal } from './CveAiSummaryModal';
import { getLatestThreatsApi, analyzeCveWithAiApi } from '../../services/api.client';

export const CveRadarTab: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<CveItem[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>();
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCveId, setActiveCveId] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<CveAiAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadThreats = async () => {
      setLoading(true);
      try {
        const data = await getLatestThreatsApi(selectedKeyword, 40, selectedStartDate, selectedEndDate);
        if (isMounted && data.success) {
          setVulnerabilities(data.vulnerabilities || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadThreats();
    return () => {
      isMounted = false;
    };
  }, [selectedKeyword, selectedStartDate, selectedEndDate]);

  const handleFilterSubmit = (keyword: string, startDate?: string, endDate?: string) => {
    setSelectedKeyword(keyword);
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  const handleAnalyzeWithAi = async (item: CveItem) => {
    setActiveCveId(item.id);
    setAiAnalysis(null);
    setLoadingAi(true);

    try {
      const data = await analyzeCveWithAiApi({
        cveId: item.id,
        severity: item.severity,
        cvssScore: item.cvssScore,
        description: item.description,
        targetStack: selectedKeyword || 'General',
      });
      if (data.success) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: '#ef4444',
      HIGH: '#f97316',
      MEDIUM: '#eab308',
      LOW: '#22c55e',
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <div style={{ background: '#09090b', padding: '24px', borderRadius: '8px', border: '1px solid #27272a' }}>
      <h2 style={{ marginTop: 0, color: '#38bdf8' }}>📰 CiberThreat Feed & CVE Radar</h2>
      <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '16px' }}>
        Monitoreo en tiempo real de vulnerabilidades reportadas en la NVD/NIST. Filtra por stack tecnológico o rango de fechas y analiza su impacto con Gemini AI.
      </p>

      <StackFilterBar
        selectedKeyword={selectedKeyword}
        onFilterSubmit={handleFilterSubmit}
        disabled={loading}
      />

      {loading ? (
        <p style={{ color: '#60a5fa' }}>🔄 Consultando vulnerabilidades con los criterios seleccionados...</p>
      ) : error ? (
        <p style={{ color: '#f87171' }}>⚠️ Error al conectar con el Radar: {error}</p>
      ) : vulnerabilities.length === 0 ? (
        <div
          style={{
            background: '#18181b',
            padding: '28px',
            borderRadius: '8px',
            border: '1px solid #ef4444',
            textAlign: 'center',
            marginTop: '20px',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)',
          }}
        >
          <p style={{ color: '#fca5a5', fontSize: '1.05rem', fontWeight: 'bold', margin: 0 }}>
            ⚠️ No se encontró información para la tecnología y fechas seleccionadas
          </p>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '10px' }}>
            <span>Tecnología: <strong style={{ color: '#38bdf8' }}>"{selectedKeyword || 'Todas'}"</strong></span>
            {selectedStartDate && selectedEndDate && (
              <span style={{ marginLeft: '12px' }}>
                | Rango enviado: <strong style={{ color: '#f4f4f5' }}>{selectedStartDate}</strong> a <strong style={{ color: '#f4f4f5' }}>{selectedEndDate}</strong>
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {vulnerabilities.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#18181b',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#f4f4f5', fontSize: '1rem' }}>{item.id}</span>
                  <span
                    style={{
                      background: getSeverityBadge(item.severity),
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.severity} ({item.cvssScore})
                  </span>
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '0 0 8px 0' }}>{item.description}</p>
                <small style={{ color: '#71717a' }}>Publicado: {new Date(item.publishedAt).toLocaleDateString()}</small>
              </div>

              <button
                onClick={() => handleAnalyzeWithAi(item)}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ✨ Analizar con IA
              </button>
            </div>
          ))}
        </div>
      )}

      {activeCveId && (
        <CveAiSummaryModal
          cveId={activeCveId}
          analysis={aiAnalysis}
          loading={loadingAi}
          onClose={() => setActiveCveId('')}
        />
      )}
    </div>
  );
};