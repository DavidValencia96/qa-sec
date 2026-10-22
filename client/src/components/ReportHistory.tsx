import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { DastHistoryTable } from './history/DastHistoryTable';
import { EasmHistoryTable } from './history/EasmHistoryTable';
import { RedTeamHistoryTable } from './history/RedTeamHistoryTable';
import { EmailSecHistoryTable } from './history/EmailSecHistoryTable';
import { SastDiffModal } from './sast/SastDiffModal';
import { SastFindingsTable } from './sast/SastFindingsTable';
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

export interface RedTeamHistoryItem {
  id: string;
  targetUrl: string;
  jwtToken?: string;
  jwtFindingsJson?: string;
  corsFindingsJson?: string;
  phishingCount?: number;
  aiSummaryJson?: string;
  createdAt: string;
}

export interface EmailSecHistoryItem {
  id: string;
  targetDomain?: string;
  targetIp?: string;
  spfJson?: string;
  dmarcJson?: string;
  dkimJson?: string;
  rblJson?: string;
  headersJson?: string;
  aiSummaryJson?: string;
  createdAt: string;
}

type SubTabType = 'web' | 'sast' | 'load' | 'dast' | 'sca' | 'easm' | 'redteam' | 'emailsec';

export const ReportHistory: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('web');

  // Estados del Historial Web
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados fuertemente tipados
  const [dastItems, setDastItems] = useState<DastHistoryItem[]>([]);
  const [scaItems, setScaItems] = useState<ScaHistoryItem[]>([]);
  const [easmItems, setEasmItems] = useState<EasmHistoryItem[]>([]);
  const [redteamItems, setRedteamItems] = useState<RedTeamHistoryItem[]>([]);
  const [emailsecItems, setEmailsecItems] = useState<EmailSecHistoryItem[]>([]);

  // Modal Reporte Web
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedTargetUrl, setSelectedTargetUrl] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);

  // Historial SAST
  const [sastItems, setSastItems] = useState<SastHistoryItem[]>([]);
  const [loadingSast, setLoadingSast] = useState<boolean>(false);
  const [selectedSastAudit, setSelectedSastAudit] = useState<SastHistoryItem | null>(null);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  // Historial Pruebas de Carga
  const [loadTestItems, setLoadTestItems] = useState<LoadTestHistoryItem[]>([]);
  const [loadingLoadTest, setLoadingLoadTest] = useState<boolean>(false);

  // Modal Exportación Consolidada
  const [showConsolidatedModal, setShowConsolidatedModal] = useState<boolean>(false);
  const [exportingConsolidated, setExportingConsolidated] = useState<boolean>(false);

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
          if (Array.isArray(data.redteamHistory)) setRedteamItems(data.redteamHistory);
          if (Array.isArray(data.emailsecHistory)) setEmailsecItems(data.emailsecHistory);
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

  // Bloquea el scroll del fondo cuando hay un detalle SAST abierto en portal
  useEffect(() => {
    if (selectedSastAudit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedSastAudit]);

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

  const handleExportSingleRedTeam = async (item: RedTeamHistoryItem) => {
    try {
      const jwtFindings = item.jwtFindingsJson ? JSON.parse(item.jwtFindingsJson) : [];
      const corsFindings = item.corsFindingsJson ? JSON.parse(item.corsFindingsJson) : [];
      const aiSummary = item.aiSummaryJson ? JSON.parse(item.aiSummaryJson) : {};

      await exportSingleRecordApi({
        moduleType: 'redteam',
        recordData: {
          id: item.id,
          targetUrl: item.targetUrl,
          jwtToken: item.jwtToken || null,
          jwtFindings,
          corsFindings,
          phishingSimulatedCount: item.phishingCount || 0,
          aiSummary,
          createdAt: item.createdAt,
        },
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar reporte Red Team: ${(err as Error).message}`);
    }
  };

  const handleExportSingleEmailSec = async (item: EmailSecHistoryItem) => {
    try {
      await exportSingleRecordApi({
        moduleType: 'emailsec',
        recordData: item,
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar reporte Email Security: ${(err as Error).message}`);
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

  const tabsConfig: Array<{ id: SubTabType; label: string; icon: string }> = [
    { id: 'web', label: 'Escáneres & Pruebas Web', icon: '🌐' },
    { id: 'sast', label: 'Auditorías SAST & Código', icon: '🔍' },
    { id: 'load', label: 'Pruebas de Carga & DoS', icon: '🎯' },
    { id: 'dast', label: 'DAST & OpenAPI', icon: '🛡️' },
    { id: 'sca', label: 'SCA & Supply Chain', icon: '🔐' },
    { id: 'easm', label: 'EASM & OSINT', icon: '🕸️' },
    { id: 'redteam', label: 'Red Team & Explotación', icon: '⚔️' },
    { id: 'emailsec', label: 'Email Sec & OSINT', icon: '✉️' },
  ];

  return (
    <div style={{ width: '100%', margin: '0', padding: '0', backgroundColor: 'transparent', boxSizing: 'border-box' }}>
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          boxSizing: 'border-box',
        }}
      >
        {/* HEADER Y BOTÓN EXPORTAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#38bdf8' }}>📜</span> Historial Centralizado de Seguridad
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Persistencia global de ejecuciones, trazabilidad técnica y reportes exportables.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConsolidatedModal(true)}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>📄</span> Exportar Informe Consolidado Global
          </button>
        </div>

        {/* SUBPESTAÑAS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(30, 41, 59, 0.8)' }}>
          {tabsConfig.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#0284c7' : 'rgba(2, 6, 23, 0.7)',
                  color: '#ffffff',
                  border: isActive ? '1px solid #38bdf8' : '1px solid rgba(30, 41, 59, 0.9)',
                  boxShadow: isActive ? '0 0 12px rgba(2, 132, 199, 0.5)' : 'none',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* BUSCADOR */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por ID, Tipo, Proyecto, Suite o URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(2, 6, 23, 0.95)',
              border: '1px solid rgba(30, 41, 59, 0.9)',
              color: '#f8fafc',
              fontSize: '12px',
              borderRadius: '10px',
              padding: '12px 16px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* CONTENIDO DE TABLAS */}
        <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(30, 41, 59, 0.8)', borderRadius: '12px', padding: '16px', minHeight: '380px', width: '100%', boxSizing: 'border-box' }}>
          {activeSubTab === 'web' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
                  <span className="animate-spin text-lg mr-2">🔄</span> Cargando historial desde la base de datos...
                </div>
              ) : (
                <>
                  <HistoryTable items={filteredItems} onOpenReportModal={handleOpenReportModal} />
                  <ReportModal report={selectedReport} targetUrl={selectedTargetUrl} loading={loadingReport} onClose={() => setSelectedReport(null)} />
                </>
              )}
            </div>
          )}

          {activeSubTab === 'sast' && (
            <div className="space-y-4">
              {loadingSast ? (
                <div className="flex items-center justify-center py-12 text-cyan-400 text-xs">
                  <span className="animate-spin text-lg mr-2">🔄</span> Cargando registros SAST desde MySQL...
                </div>
              ) : (
                <SastHistoryTable items={sastItems} onSelectAudit={(item) => setSelectedSastAudit(item)} />
              )}
            </div>
          )}

          {activeSubTab === 'load' && (
            <div className="space-y-4">
              {loadingLoadTest ? (
                <div className="flex items-center justify-center py-12 text-cyan-400 text-xs">
                  <span className="animate-spin text-lg mr-2">🔄</span> Cargando registros de pruebas de carga desde MySQL...
                </div>
              ) : (
                <LoadTestHistoryTable items={loadTestItems} onExportSingleRecord={handleExportSingleLoadTest} />
              )}
            </div>
          )}

          {/* SUBPESTAÑA DAST */}
          {activeSubTab === 'dast' && <DastHistoryTable items={dastItems} />}

          {/* SUBPESTAÑA SCA */}
          {activeSubTab === 'sca' && <ScaHistoryTable items={scaItems} />}

          {/* SUBPESTAÑA EASM */}
          {activeSubTab === 'easm' && (
            <EasmHistoryTable items={easmItems} onExportSingleRecord={handleExportSingleEasm} />
          )}

          {/* SUBPESTAÑA RED TEAM */}
          {activeSubTab === 'redteam' && (
            <RedTeamHistoryTable items={redteamItems} onExportSingleRecord={handleExportSingleRedTeam} />
          )}

          {/* SUBPESTAÑA EMAIL SEC CON COMPONENTE MEJORADO */}
          {activeSubTab === 'emailsec' && (
            <EmailSecHistoryTable items={emailsecItems} onExportSingleRecord={handleExportSingleEmailSec} />
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE SAST EN PORTAL CIBERNÉTICO CENTRADO */}
      {selectedSastAudit &&
        createPortal(
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(2, 6, 23, 0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '920px', maxHeight: '85vh', backgroundColor: '#090d16', border: '1px solid #0284c7', borderRadius: '16px', boxShadow: '0 0 35px rgba(2, 132, 199, 0.45)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', position: 'relative', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30, 41, 59, 0.8)', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold', color: '#38bdf8', backgroundColor: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    SAST AUDIT DIAGNOSTIC PANEL
                  </span>
                  <h3 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>
                    📄 Detalle de Auditoría: <span style={{ color: '#38bdf8' }}>{selectedSastAudit.fileName}</span>
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {selectedSastAudit.remediatedCode && (
                    <button
                      type="button"
                      onClick={() => setShowDiffModal(true)}
                      style={{ backgroundColor: '#0284c7', color: '#ffffff', border: '1px solid #38bdf8', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)' }}
                    >
                      ✨ Ver Refactorización
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedSastAudit(null)}
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    ✕ Cerrar
                  </button>
                </div>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                <SastFindingsTable findings={mappedSastFindings} />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL REFACTORIZACIÓN DIFF */}
      {showDiffModal && selectedSastAudit?.remediatedCode && (
        <SastDiffModal remediatedCode={selectedSastAudit.remediatedCode} fileName={selectedSastAudit.fileName} onClose={() => setShowDiffModal(false)} />
      )}

      {/* MODAL EXPORTACIÓN CONSOLIDADA */}
      <ConsolidatedReportExportModal isOpen={showConsolidatedModal} onClose={() => setShowConsolidatedModal(false)} onExport={handleExportConsolidated} loading={exportingConsolidated} />
    </div>
  );
};