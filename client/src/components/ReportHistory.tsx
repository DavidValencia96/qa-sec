import React, { useState, useEffect } from 'react';
import {
  getHistoryApi,
  getReportApi,
  fetchSastHistoryApi,
  fetchLoadTestHistoryApi,
  exportConsolidatedReportApi,
  exportSingleRecordApi,
  type SastHistoryItem,
  type LoadTestHistoryItem,
} from '../services/api.client';
import type { ReportData } from './ReportViewer';
import type { HistoryItem } from './history/history.types';
import { HistoryTable } from './history/HistoryTable';
import { ReportModal } from './history/ReportModal';
import { SastHistoryTable } from './history/SastHistoryTable';
import { LoadTestHistoryTable } from './history/LoadTestHistoryTable';
import { ScaHistoryTable } from './history/ScaHistoryTable';
import { SastDiffModal } from './sast/SastDiffModal';
import { SastFindingsTable } from './sast/SastFindingsTable';
import { LoadTestMetricsCard } from './loadTest/LoadTestMetricsCard';
import {
  ConsolidatedReportExportModal,
  type ConsolidatedReportOptions,
} from './report/ConsolidatedReportExportModal';
import type { SastFinding } from './sast/sast.types';

export type { HistoryItem };

export interface DastHistoryItem {
  id: string;
  targetBaseUrl: string;
  totalEndpointsTested: number;
  findingsJson?: string;
  aiSummaryJson?: string;
  createdAt: string;
}

export interface ScaHistoryItem {
  id: string;
  manifestType: string;
  totalDepsAudited: number;
  vulnerabilitiesJson?: string;
  gitSecretsJson?: string;
  aiSummaryJson?: string;
  createdAt: string;
}

export interface EasmHistoryItem {
  id: string;
  targetDomain: string;
  dnsRecordsJson?: string;
  subdomainsJson?: string;
  wafTechJson?: string;
  sslDetailsJson?: string;
  aiSummaryJson?: string;
  createdAt: string;
}

type SubTabType = 'web' | 'sast' | 'load' | 'dast' | 'sca' | 'easm';

export const ReportHistory: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('web');

  // Estados del Historial Web Dinámico
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados fuertemente tipados para DAST, SCA y EASM
  const [dastItems, setDastItems] = useState<DastHistoryItem[]>([]);
  const [scaItems, setScaItems] = useState<ScaHistoryItem[]>([]);
  const [easmItems, setEasmItems] = useState<EasmHistoryItem[]>([]);

  // Estados para el Modal del Reporte Web
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedTargetUrl, setSelectedTargetUrl] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);

  // Estados para el Historial SAST
  const [sastItems, setSastItems] = useState<SastHistoryItem[]>([]);
  const [loadingSast, setLoadingSast] = useState<boolean>(false);
  const [selectedSastAudit, setSelectedSastAudit] = useState<SastHistoryItem | null>(null);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  // Estados para el Historial de Pruebas de Carga
  const [loadTestItems, setLoadTestItems] = useState<LoadTestHistoryItem[]>([]);
  const [loadingLoadTest, setLoadingLoadTest] = useState<boolean>(false);
  const [selectedLoadTest, setSelectedLoadTest] = useState<LoadTestHistoryItem | null>(null);

  // Estados para el Modal de Exportación Consolidada
  const [showConsolidatedModal, setShowConsolidatedModal] = useState<boolean>(false);
  const [exportingConsolidated, setExportingConsolidated] = useState<boolean>(false);

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

  // Función explícita para cargar el historial de Pruebas de Carga
  const loadLoadTestHistory = async () => {
    setLoadingLoadTest(true);
    try {
      const data = await fetchLoadTestHistoryApi();
      setLoadTestItems(data);
    } catch (err) {
      console.error('Error al cargar historial de Pruebas de Carga:', err);
    } finally {
      setLoadingLoadTest(false);
    }
  };

  // Cargar Historiales al montar
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await getHistoryApi();
        if (isMounted && data.success) {
          if (Array.isArray(data.history)) setItems(data.history);
          if (Array.isArray(data.dastHistory)) setDastItems(data.dastHistory);
          if (Array.isArray(data.scaHistory)) setScaItems(data.scaHistory);
          if (Array.isArray(data.easmHistory)) setEasmItems(data.easmHistory);
        }
      } catch (err) {
        console.error('Error al cargar historial centralizado:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tab: SubTabType) => {
    setActiveSubTab(tab);
    if (tab === 'sast' && sastItems.length === 0) {
      loadSastHistory();
    } else if (tab === 'load' && loadTestItems.length === 0) {
      loadLoadTestHistory();
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

  const handleExportConsolidated = async (options: ConsolidatedReportOptions) => {
    setExportingConsolidated(true);
    try {
      await exportConsolidatedReportApi(options);
      setShowConsolidatedModal(false);
    } catch (err) {
      alert(`Error al exportar reporte consolidado: ${(err as Error).message}`);
    } finally {
      setExportingConsolidated(false);
    }
  };

  const handleExportSingleLoadTest = async (item: LoadTestHistoryItem) => {
    try {
      await exportSingleRecordApi({
        moduleType: 'load-test',
        recordData: item,
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar registro individual: ${(err as Error).message}`);
    }
  };

  const handleExportSingleEasm = async (item: EasmHistoryItem) => {
    try {
      const dnsRecords = item.dnsRecordsJson ? JSON.parse(item.dnsRecordsJson) : [];
      const subdomains = item.subdomainsJson ? JSON.parse(item.subdomainsJson) : [];
      const wafAndTech = item.wafTechJson ? JSON.parse(item.wafTechJson) : {};
      const sslDetails = item.sslDetailsJson ? JSON.parse(item.sslDetailsJson) : {};
      const aiSummary = item.aiSummaryJson ? JSON.parse(item.aiSummaryJson) : {};

      await exportSingleRecordApi({
        moduleType: 'easm',
        recordData: {
          id: item.id,
          targetDomain: item.targetDomain,
          dnsRecords,
          subdomains,
          wafAndTech,
          sslDetails,
          aiSummary,
          createdAt: item.createdAt,
        },
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar reporte EASM: ${(err as Error).message}`);
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
      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>
          📜 Historial Centralizado de Seguridad
        </h2>

        <button
          type="button"
          onClick={() => setShowConsolidatedModal(true)}
          style={{
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 10px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          📄 Exportar Informe Consolidado Global
        </button>
      </div>

      {/* BOTONES PESTAÑA SUB-NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
          }}
        >
          🔍 Auditorías SAST & Código
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('load')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'load' ? '#2563eb' : '#27272a',
            color: '#ffffff',
            boxShadow: activeSubTab === 'load' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
          }}
        >
          🎯 Pruebas de Carga & DoS
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('dast')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'dast' ? '#2563eb' : '#27272a',
            color: '#ffffff',
            boxShadow: activeSubTab === 'dast' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
          }}
        >
          🛡️ DAST & OpenAPI
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('sca')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'sca' ? '#2563eb' : '#27272a',
            color: '#ffffff',
            boxShadow: activeSubTab === 'sca' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
          }}
        >
          🔐 SCA & Supply Chain
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('easm')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'easm' ? '#2563eb' : '#27272a',
            color: '#ffffff',
            boxShadow: activeSubTab === 'easm' ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
          }}
        >
          🕸️ EASM & OSINT
        </button>
      </div>

      {/* CONTENIDO 1: HISTORIAL WEB */}
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

      {/* CONTENIDO 2: HISTORIAL SAST */}
      {activeSubTab === 'sast' && (
        <>
          {loadingSast ? (
            <div style={{ color: '#60a5fa', padding: '20px 0' }}>🔄 Cargando registros SAST desde MySQL...</div>
          ) : (
            <>
              <SastHistoryTable items={sastItems} onSelectAudit={(item) => setSelectedSastAudit(item)} />

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

      {/* CONTENIDO 3: HISTORIAL PRUEBAS DE CARGA */}
      {activeSubTab === 'load' && (
        <>
          {loadingLoadTest ? (
            <div style={{ color: '#60a5fa', padding: '20px 0' }}>🔄 Cargando registros de pruebas de carga desde MySQL...</div>
          ) : (
            <>
              <LoadTestHistoryTable
                items={loadTestItems}
                onSelectResult={(item) => setSelectedLoadTest(item)}
                onExportSingleRecord={handleExportSingleLoadTest}
              />

              {selectedLoadTest && (
                <div style={{ marginTop: '24px', background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#38bdf8' }}>
                      🎯 Detalle de Prueba de Estrés: {selectedLoadTest.targetUrl}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedLoadTest(null)}
                      style={{ background: '#27272a', color: '#a1a1aa', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      ✕ Cerrar Detalle
                    </button>
                  </div>

                  <LoadTestMetricsCard
                    result={{
                      runId: selectedLoadTest.id,
                      config: {
                        targetUrl: selectedLoadTest.targetUrl,
                        method: selectedLoadTest.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
                        concurrency: selectedLoadTest.concurrency,
                        durationSeconds: selectedLoadTest.durationSeconds,
                      },
                      metrics: selectedLoadTest.metrics,
                      aiDiagnosis: selectedLoadTest.aiDiagnosis,
                    }}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* CONTENIDO 4: HISTORIAL DAST */}
      {activeSubTab === 'dast' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f4f4f5', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#09090b', borderBottom: '1px solid #27272a', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID Ejecución</th>
                <th style={{ padding: '12px' }}>URL Base Target</th>
                <th style={{ padding: '12px' }}>Endpoints Probados</th>
                <th style={{ padding: '12px' }}>Hallazgos</th>
                <th style={{ padding: '12px' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {dastItems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#a1a1aa' }}>
                    No se registran auditorías DAST en el historial.
                  </td>
                </tr>
              ) : (
                dastItems.map((item) => {
                  const findings = item.findingsJson ? JSON.parse(item.findingsJson) : [];
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #27272a' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8' }}>{item.id}</td>
                      <td style={{ padding: '12px' }}>{item.targetBaseUrl}</td>
                      <td style={{ padding: '12px' }}>{item.totalEndpointsTested}</td>
                      <td style={{ padding: '12px', color: findings.length > 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                        {findings.length} Hallazgos
                      </td>
                      <td style={{ padding: '12px', color: '#a1a1aa' }}>
                        {new Date(item.createdAt).toLocaleString('es-ES')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENIDO 5: HISTORIAL SCA */}
      {activeSubTab === 'sca' && <ScaHistoryTable items={scaItems} />}

      {/* CONTENIDO 6: HISTORIAL EASM */}
      {activeSubTab === 'easm' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f4f4f5', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#09090b', borderBottom: '1px solid #27272a', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID Ejecución</th>
                <th style={{ padding: '12px' }}>Dominio Objetivo</th>
                <th style={{ padding: '12px' }}>Subdominios Detectados</th>
                <th style={{ padding: '12px' }}>Certificado SSL</th>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {easmItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#a1a1aa' }}>
                    No se registran auditorías EASM en el historial.
                  </td>
                </tr>
              ) : (
                easmItems.map((item) => {
                  const subdomains = item.subdomainsJson ? JSON.parse(item.subdomainsJson) : [];
                  const sslDetails = item.sslDetailsJson ? JSON.parse(item.sslDetailsJson) : {};
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #27272a' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8' }}>{item.id}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.targetDomain}</td>
                      <td style={{ padding: '12px', color: '#38bdf8' }}>{subdomains.length} subdominios</td>
                      <td style={{ padding: '12px', color: sslDetails.valid ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                        {sslDetails.valid ? 'VÁLIDO' : 'INVÁLIDO / EXPIRADO'}
                      </td>
                      <td style={{ padding: '12px', color: '#a1a1aa' }}>
                        {new Date(item.createdAt).toLocaleString('es-ES')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleExportSingleEasm(item)}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          📥 Exportar PDF / HTML
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE EXPORTACIÓN CONSOLIDADA */}
      <ConsolidatedReportExportModal
        isOpen={showConsolidatedModal}
        onClose={() => setShowConsolidatedModal(false)}
        onExport={handleExportConsolidated}
        loading={exportingConsolidated}
      />
    </div>
  );
};