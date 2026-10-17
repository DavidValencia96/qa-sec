import React, { useState, useEffect } from 'react';
import { getHistoryApi, getReportApi, fetchSastHistoryApi, type SastHistoryItem } from '../services/api.client';
import type { ReportData } from './ReportViewer';
import type { HistoryItem } from './history/history.types';
import { HistoryTable } from './history/HistoryTable';
import { ReportModal } from './history/ReportModal';
import { SastHistoryTable } from './history/SastHistoryTable';
import { SastDiffModal } from './sast/SastDiffModal';
import { SastFindingsTable } from './sast/SastFindingsTable';
import type { SastFinding } from './sast/sast.types';

export type { HistoryItem };

export const ReportHistory: React.FC = () => {
  // Estado para la pestaña de historial activa ('web' | 'sast')
  const [activeSubTab, setActiveSubTab] = useState<'web' | 'sast'>('web');

  // Estados del Historial Web Dinámico (Existentes)
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para el Modal del Reporte Web (Existentes)
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedTargetUrl, setSelectedTargetUrl] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);

  // Estados para el Historial SAST (Nuevos)
  const [sastItems, setSastItems] = useState<SastHistoryItem[]>([]);
  const [loadingSast, setLoadingSast] = useState<boolean>(false);
  const [selectedSastAudit, setSelectedSastAudit] = useState<SastHistoryItem | null>(null);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  // Función explícita para cargar el historial SAST
  const loadSastHistory = async () => {
    setLoadingSast(true);
    try {
      const data = await fetchSastHistoryApi();
      setSastItems(data);
    } catch (err) {
      console.error('Error al cargar historial SAST:', err);
    } finally {
      setLoadingSast(false);
    }
  };

  // Cargar Historial Web al montar
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await getHistoryApi();
        if (isMounted && data.success && Array.isArray(data.history)) {
          setItems(data.history);
        }
      } catch (err) {
        console.error('Error al cargar historial web:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler para cambiar de pestaña sin disparar cascading renders en useEffect
  const handleTabChange = (tab: 'web' | 'sast') => {
    setActiveSubTab(tab);
    if (tab === 'sast' && sastItems.length === 0) {
      loadSastHistory();
    }
  };

  const handleOpenReportModal = async (item: HistoryItem) => {
    setLoadingReport(true);
    setSelectedTargetUrl(item.targetUrl || '');
    try {
      const data = await getReportApi(item.runId);
      setSelectedReport(data as ReportData);
    } catch (err) {
      alert(`Error al obtener el reporte: ${(err as Error).message}`);
    } finally {
      setLoadingReport(false);
    }
  };

  const filterItem = (item: HistoryItem, query: string) => {
    const q = query.toLowerCase();
    return (
      item.runId?.toLowerCase().includes(q) ||
      item.projectName?.toLowerCase().includes(q) ||
      item.suiteName?.toLowerCase().includes(q) ||
      item.targetUrl?.toLowerCase().includes(q) ||
      item.auditType?.toLowerCase().includes(q)
    );
  };

  const filteredItems = items.filter((i) => filterItem(i, searchTerm));

// Mapear hallazgos garantizando compatibilidad exacta de tipos (no undefined)
  const mappedSastFindings: SastFinding[] = selectedSastAudit
    ? selectedSastAudit.findings.map((f, idx) => ({
        id: `finding-hist-${idx}`,
        ruleId: 'SAST-HIST-RULE',
        type: selectedSastAudit.fileType as SastFinding['type'],
        title: f.title,
        severity: f.severity as SastFinding['severity'],
        description: f.description,
        recommendation: f.recommendation || '',
        evidence: f.evidence || '',
      }))
    : [];

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ color: '#fff', marginTop: 0, fontSize: '20px', marginBottom: '16px' }}>
        📜 Historial Centralizado de Seguridad
      </h2>

      {/* BOTONES PESTAÑA SUB-NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => handleTabChange('web')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'web' ? '#2563eb' : '#27272a',
            color: '#ffffff',
            boxShadow: activeSubTab === 'web' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          🌐 Escáneres & Pruebas Web
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('sast')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'sast' ? '#2563eb' : '#27272a',
            color: '#ffffff',
            boxShadow: activeSubTab === 'sast' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          🔍 Auditorías SAST & Código
        </button>
      </div>

      {/* CONTENIDO 1: HISTORIAL WEB (PLAYWRIGHT / INPUTS / RED) */}
      {activeSubTab === 'web' && (
        <>
          {loading ? (
            <div style={{ color: '#aaa', padding: '20px 0' }}>Cargando historial de MySQL...</div>
          ) : (
            <>
              <input
                type="text"
                placeholder="🔍 Buscar por ID, Tipo, Proyecto, Suite o URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#09090b',
                  color: '#fff',
                  fontSize: '14px',
                  marginBottom: '20px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />

              <HistoryTable items={filteredItems} onOpenReportModal={handleOpenReportModal} />

              <ReportModal
                report={selectedReport}
                targetUrl={selectedTargetUrl}
                loading={loadingReport}
                onClose={() => setSelectedReport(null)}
              />
            </>
          )}
        </>
      )}

      {/* CONTENIDO 2: HISTORIAL SAST & SECRET SCANNING */}
      {activeSubTab === 'sast' && (
        <>
          {loadingSast ? (
            <div style={{ color: '#60a5fa', padding: '20px 0' }}>🔄 Cargando registros SAST desde MySQL...</div>
          ) : (
            <>
              <SastHistoryTable items={sastItems} onSelectAudit={(item) => setSelectedSastAudit(item)} />

              {/* Vista expandida de hallazgos para una auditoría SAST seleccionada */}
              {selectedSastAudit && (
                <div style={{ marginTop: '24px', background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#38bdf8' }}>
                      📄 Detalle de Auditoría: {selectedSastAudit.fileName}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {selectedSastAudit.remediatedCode && (
                        <button
                          type="button"
                          onClick={() => setShowDiffModal(true)}
                          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          ✨ Ver Refactorización
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedSastAudit(null)}
                        style={{ background: '#27272a', color: '#a1a1aa', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✕ Cerrar Detalle
                      </button>
                    </div>
                  </div>

                  <SastFindingsTable findings={mappedSastFindings} />
                </div>
              )}

              {showDiffModal && selectedSastAudit?.remediatedCode && (
                <SastDiffModal
                  remediatedCode={selectedSastAudit.remediatedCode}
                  fileName={selectedSastAudit.fileName}
                  onClose={() => setShowDiffModal(false)}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};