import React, { useEffect, useState } from 'react';
import type { CveItem, CveAiAnalysis } from './cve.types';
import { StackFilterBar } from './StackFilterBar';
import { CveAiSummaryModal } from './CveAiSummaryModal';
import { getLatestThreatsApi, analyzeCveWithAiApi } from '../../services/api.client';
import { ModuleGuard } from '../auth/ModuleGuard';
import { useAuth } from '../../context/useAuth';

export interface CveModuleData {
  vulnerabilities: CveItem[];
  selectedKeyword: string;
  selectedStartDate?: string;
  selectedEndDate?: string;
  activeCveId: string;
  aiAnalysis: CveAiAnalysis | null;
}

interface CveRadarTabProps {
  cveData?: CveModuleData;
  onUpdateCveData?: (data: Partial<CveModuleData>) => void;
}

export const CveRadarTab: React.FC<CveRadarTabProps> = ({ cveData, onUpdateCveData }) => {
  const { user } = useAuth();

  const [vulnerabilities, setVulnerabilities] = useState<CveItem[]>(cveData?.vulnerabilities || []);
  const [selectedKeyword, setSelectedKeyword] = useState<string>(cveData?.selectedKeyword || '');
  const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>(cveData?.selectedStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState<string | undefined>(cveData?.selectedEndDate);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeCveId, setActiveCveId] = useState<string>(cveData?.activeCveId || '');
  const [aiAnalysis, setAiAnalysis] = useState<CveAiAnalysis | null>(cveData?.aiAnalysis || null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Derivación segura de estado al cambiar pestañas
  const [prevCveData, setPrevCveData] = useState(cveData);
  if (cveData !== prevCveData) {
    setPrevCveData(cveData);
    if (cveData?.vulnerabilities) setVulnerabilities(cveData.vulnerabilities);
    if (cveData?.selectedKeyword !== undefined) setSelectedKeyword(cveData.selectedKeyword);
    if (cveData?.selectedStartDate !== undefined) setSelectedStartDate(cveData.selectedStartDate);
    if (cveData?.selectedEndDate !== undefined) setSelectedEndDate(cveData.selectedEndDate);
    if (cveData?.activeCveId !== undefined) setActiveCveId(cveData.activeCveId);
    if (cveData?.aiAnalysis !== undefined) setAiAnalysis(cveData.aiAnalysis);
  }

  const loadThreats = async (kw: string, start?: string, end?: string) => {
    setLoading(true);
    try {
      const data = await getLatestThreatsApi(kw, 40, start, end);
      if (data && data.success) {
        const fetchedVulns = data.vulnerabilities || [];
        setVulnerabilities(fetchedVulns);
        setError(null);
        if (onUpdateCveData) {
          onUpdateCveData({
            vulnerabilities: fetchedVulns,
            selectedKeyword: kw,
            selectedStartDate: start,
            selectedEndDate: end,
          });
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Evita consultar el backend y evita errores 403 si el usuario no tiene la clave CVE
    const hasPermission = user?.role === 'ADMIN' || user?.allowed_modules?.includes('CVE');
    if (!hasPermission) {
      return;
    }

    if (!cveData?.vulnerabilities || cveData.vulnerabilities.length === 0) {
      const timer = setTimeout(() => {
        loadThreats(selectedKeyword, selectedStartDate, selectedEndDate);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFilterSubmit = (keyword: string, startDate?: string, endDate?: string) => {
    setSelectedKeyword(keyword);
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    loadThreats(keyword, startDate, endDate);
  };

  const handleAnalyzeWithAi = async (item: CveItem) => {
    setActiveCveId(item.id);
    setAiAnalysis(null);
    setLoadingAi(true);

    if (onUpdateCveData) {
      onUpdateCveData({ activeCveId: item.id, aiAnalysis: null });
    }

    try {
      const data = await analyzeCveWithAiApi({
        cveId: item.id,
        severity: item.severity,
        cvssScore: item.cvssScore,
        description: item.description,
        targetStack: selectedKeyword || 'General',
      });

      if (data && (data.success || data.analysis)) {
        const analysisResult = data.analysis || data.summary;
        setAiAnalysis(analysisResult);
        if (onUpdateCveData) {
          onUpdateCveData({ activeCveId: item.id, aiAnalysis: analysisResult });
        }
      } else {
        alert(`No se pudo obtener el diagnóstico: ${data?.error || 'Sin respuesta'}`);
      }
    } catch (err) {
      console.error('Error al consultar IA para CVE:', err);
      alert('Error de comunicación con la API de Gemini AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCloseModal = () => {
    setActiveCveId('');
    setAiAnalysis(null);
    if (onUpdateCveData) {
      onUpdateCveData({ activeCveId: '', aiAnalysis: null });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const sev = (severity || 'UNKNOWN').toUpperCase();
    let bg = 'rgba(100, 116, 139, 0.2)';
    let color = '#94a3b8';
    let border = '#64748b';

    if (sev === 'CRITICAL') {
      bg = 'rgba(220, 38, 38, 0.25)';
      color = '#f87171';
      border = '#ef4444';
    } else if (sev === 'HIGH') {
      bg = 'rgba(234, 88, 12, 0.25)';
      color = '#fb923c';
      border = '#f97316';
    } else if (sev === 'MEDIUM') {
      bg = 'rgba(202, 138, 4, 0.25)';
      color = '#facc15';
      border = '#eab308';
    } else if (sev === 'LOW') {
      bg = 'rgba(22, 101, 52, 0.25)';
      color = '#4ade80';
      border = '#22c55e';
    }

    return (
      <span
        style={{
          background: bg,
          color,
          border: `1px solid ${border}`,
          padding: '3px 10px',
          borderRadius: '6px',
          fontSize: '0.78rem',
          fontWeight: 'bold',
        }}
      >
        {sev}
      </span>
    );
  };

  return (
    <ModuleGuard moduleKey="CVE" moduleTitle="Radar de Amenazas y CVE">
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(10px)',
          padding: '28px',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          marginBottom: '28px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* CABECERA CON BADGE DE CATEGORÍA */}
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
              📰 CiberThreat Feed & CVE Radar
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Monitoreo en tiempo real de vulnerabilidades reportadas en la NVD/NIST. Filtra por stack tecnológico o rango de fechas y analiza su impacto con Gemini AI.
            </p>
          </div>

          {/* BADGE CATEGORÍA ENTERPRISE */}
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
            Threat Intelligence
          </span>
        </div>

        <StackFilterBar
          selectedKeyword={selectedKeyword}
          onFilterSubmit={handleFilterSubmit}
          disabled={loading}
        />

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem', display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span>
            <p style={{ color: '#38bdf8', fontWeight: 'bold', marginTop: '12px' }}>
              Consultando vulnerabilidades con los criterios seleccionados...
            </p>
          </div>
        ) : error ? (
          <p style={{ color: '#f87171', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' }}>
            ⚠️ Error al conectar con el Radar: {error}
          </p>
        ) : vulnerabilities.length === 0 ? (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '28px',
              borderRadius: '10px',
              border: '1px solid #ef4444',
              textAlign: 'center',
              marginTop: '20px',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)',
            }}
          >
            <p style={{ color: '#fca5a5', fontSize: '1.05rem', fontWeight: 'bold', margin: 0 }}>
              ⚠️ No se encontró información para la tecnología y fechas seleccionadas
            </p>
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '10px' }}>
              <span>Tecnología: <strong style={{ color: '#38bdf8' }}>"{selectedKeyword || 'Todas'}"</strong></span>
              {selectedStartDate && selectedEndDate && (
                <span style={{ marginLeft: '12px' }}>
                  | Rango enviado: <strong style={{ color: '#f4f4f5' }}>{selectedStartDate}</strong> a <strong style={{ color: '#f4f4f5' }}>{selectedEndDate}</strong>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {vulnerabilities.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: '#f4f4f5', fontSize: '1rem', fontFamily: 'monospace' }}>
                      {item.id}
                    </span>
                    {getSeverityBadge(item.severity)}
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      CVSS: {item.cvssScore}
                    </span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                    {item.description}
                  </p>
                  <small style={{ color: '#64748b', fontWeight: '600' }}>
                    Publicado: {new Date(item.publishedAt).toLocaleDateString()}
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => handleAnalyzeWithAi(item)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#fff',
                    border: '1px solid #38bdf8',
                    borderRadius: '6px',
                    padding: '9px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
                  }}
                >
                  ✨ Analizar con IA
                </button>
              </div>
            ))}
          </div>
        )}

        {Boolean(activeCveId) && (
          <CveAiSummaryModal
            cveId={activeCveId}
            analysis={aiAnalysis}
            loading={loadingAi}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </ModuleGuard>
  );
};