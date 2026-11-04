import { useState, useEffect } from 'react';
import {
  createProjectApi,
  runTestApi,
  getReportApi,
  sendHeartbeatApi,
  type DastAuditResponse,
  type ScaAuditResponse,
  type DependencyManifestType,
} from './services/api.client';
import { AISuiteGenerator } from './components/AISuiteGenerator';
import { InputSuiteGenerator } from './components/InputSuiteGenerator';
import { ReportViewer, type ReportData } from './components/ReportViewer';
import { ReportHistory } from './components/ReportHistory';
import { NetworkConfigAuditor } from './components/NetworkConfigAuditor';
import type { ServiceItem } from './components/network/NetworkPortsTable';
import type { MitigationRule } from './components/network/NetworkAiDiagnosis';

import { NavigationTabs, type TabType } from './components/dashboard/NavigationTabs';
import { HomeTab } from './components/dashboard/HomeTab';
import { ProjectForm } from './components/dashboard/ProjectForm';
import { InputInjectionAuditor } from './components/dashboard/InputInjectionAuditor';
import { ScanProgressBar } from './components/dashboard/ScanProgressBar';
import type { TargetInput } from './components/dashboard/dashboard.types';
import { CveRadarTab } from './components/cve/CveRadarTab';
import { SastAuditTab } from './components/sast/SastAuditTab';
import { LoadTestTab } from './components/loadTest/LoadTestTab';
import { DastAuditTab } from './components/dast/DastAuditTab';
import { ScaAuditTab } from './components/sca/ScaAuditTab';
import { EasmAuditTab, type EasmAuditResult } from './components/EasmAuditTab';
import { RedTeamAuditTab, type RedTeamAuditResult } from './components/redteam/RedTeamAuditTab';
import { EmailSecAuditTab, type EmailSecResultState } from './components/EmailSecAuditTab';
import { ComplianceRadarTab, type ComplianceModuleData } from './components/compliance/ComplianceRadarTab';
import { AdminDashboardTab } from './components/admin/AdminDashboardTab';
import { CyberBackground } from './components/ui/CyberBackground';
import { LanguageSelector } from './components/ui/LanguageSelector';
import { useLanguage } from './context/useLanguage';
import { useAuth } from './context/useAuth.js';
import { LoginOtpModal } from './components/auth/LoginOtpModal.js';
import type { CveItem, CveAiAnalysis } from './components/cve/cve.types';
import type { SastAnalysisResponse } from './components/sast/sast.types';
import type { LoadTestResult, LoadTestConfig } from './components/loadTest/loadTest.types';

export interface NetworkAnalysis {
  riskAssessment: string;
  mitigations: MitigationRule[];
}

interface ModuleState {
  projectId: string | null;
  suiteId: string | null;
  prompt: string;
  selectedPresetId: string;
  report: ReportData | null;
  running: boolean;
  generatingSuite: boolean;
  progress: number;
  statusText: string;
  services?: ServiceItem[];
  analysis?: NetworkAnalysis | null;
  vulnerabilities?: CveItem[];
  activeCveId?: string;
  aiAnalysis?: CveAiAnalysis | null;
  startDate?: string;
  endDate?: string;
  sastResult?: SastAnalysisResponse | null;
  sastCodeSnippet?: string;
  sastFileName?: string;
  sastLanguage?: string;
  sastShowDiffModal?: boolean;
  loadTestResult?: LoadTestResult | null;
  loadTestConfig?: LoadTestConfig;
  dastTargetBaseUrl?: string;
  dastOpenApiSpecJson?: string;
  dastPrimaryAuthHeader?: string;
  dastSecondaryAuthHeader?: string;
  dastEnableBolaTesting?: boolean;
  dastEnableHeaderInjectionTesting?: boolean;
  dastAuditResult?: DastAuditResponse | null;
  scaManifestType?: DependencyManifestType;
  scaManifestContent?: string;
  scaEnableDependencyScan?: boolean;
  scaEnableGitHistoryScan?: boolean;
  scaAuditResult?: ScaAuditResponse | null;
  easmTargetDomain?: string;
  easmEnableSubdomainDiscovery?: boolean;
  easmEnableWafTechDetection?: boolean;
  easmEnableSslAudit?: boolean;
  easmResult?: EasmAuditResult | null;
  redTeamTargetUrl?: string;
  redTeamJwtToken?: string;
  redTeamEnableJwt?: boolean;
  redTeamEnableCors?: boolean;
  redTeamResult?: RedTeamAuditResult | null;
  emailSecActiveSubTab?: 'domain' | 'ip' | 'headers';
  emailSecDomain?: string;
  emailSecDkimSelector?: string;
  emailSecTargetIp?: string;
  emailSecRawHeaders?: string;
  emailSecResult?: EmailSecResultState | null;
  complianceSelectedTarget?: string;
  complianceCustomTargetInput?: string;
  complianceRadarDataResponse?: ComplianceModuleData['radarDataResponse'];
}

const defaultModuleState: ModuleState = {
  projectId: null,
  suiteId: null,
  prompt: '',
  selectedPresetId: '',
  report: null,
  running: false,
  generatingSuite: false,
  progress: 0,
  statusText: '',
  services: [],
  analysis: null,
  vulnerabilities: [],
  activeCveId: '',
  aiAnalysis: null,
  startDate: '',
  endDate: '',
  sastResult: null,
  sastCodeSnippet: '',
  sastFileName: 'snippet.ts',
  sastLanguage: 'typescript',
  sastShowDiffModal: false,
  loadTestResult: null,
  dastTargetBaseUrl: '',
  dastOpenApiSpecJson: '',
  dastPrimaryAuthHeader: '',
  dastSecondaryAuthHeader: '',
  dastEnableBolaTesting: true,
  dastEnableHeaderInjectionTesting: true,
  dastAuditResult: null,
  scaManifestType: 'package_json',
  scaManifestContent: '',
  scaEnableDependencyScan: true,
  scaEnableGitHistoryScan: true,
  scaAuditResult: null,
  easmTargetDomain: '',
  easmEnableSubdomainDiscovery: true,
  easmEnableWafTechDetection: true,
  easmEnableSslAudit: true,
  easmResult: null,
  redTeamTargetUrl: '',
  redTeamJwtToken: '',
  redTeamEnableJwt: true,
  redTeamEnableCors: true,
  redTeamResult: null,
  emailSecActiveSubTab: 'domain',
  emailSecDomain: '',
  emailSecDkimSelector: 'google',
  emailSecTargetIp: '',
  emailSecRawHeaders: '',
  emailSecResult: null,
  complianceSelectedTarget: '',
  complianceCustomTargetInput: '',
  complianceRadarDataResponse: null,
};

const PUBLIC_TABS: TabType[] = ['home', 'scanner', 'injection'];

export function App() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [targetUrl, setTargetUrl] = useState('');
  const [targetInputs, setTargetInputs] = useState<TargetInput[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [modulesData, setModulesData] = useState<Record<string, ModuleState>>({});

  const [sessionId] = useState<string>(() => {
    let id = sessionStorage.getItem('qa_sec_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('qa_sec_session_id', id);
    }
    return id;
  });

  const [onlineUsers, setOnlineUsers] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    const emitHeartbeat = async () => {
      const activeCount = await sendHeartbeatApi(sessionId);
      if (isMounted) {
        setOnlineUsers(activeCount);
      }
    };

    emitHeartbeat();
    const timer = setInterval(emitHeartbeat, 15000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [sessionId]);

  const handleNavigate = (targetTab: TabType) => {
    if (PUBLIC_TABS.includes(targetTab) || user) {
      setActiveTab(targetTab);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const currentTab = !user && !PUBLIC_TABS.includes(activeTab) ? 'home' : activeTab;
  const currentModuleState = modulesData[currentTab] || defaultModuleState;

  const updateCurrentModule = (patch: Partial<ModuleState>) => {
    setModulesData((prev) => ({
      ...prev,
      [currentTab]: {
        ...(prev[currentTab] || defaultModuleState),
        ...patch,
      },
    }));
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentModuleState.running) {
      interval = setInterval(() => {
        setModulesData((prev) => {
          const current = prev[currentTab] || defaultModuleState;
          if (!current.running) return prev;

          let newProgress = current.progress;
          let newStatus = current.statusText;

          if (current.progress < 30) {
            newStatus =
              currentTab === 'injection'
                ? t.statusLocatingDom
                : t.statusInterceptingNetwork;
            newProgress += 5;
          } else if (current.progress < 65) {
            newStatus =
              currentTab === 'injection'
                ? t.statusAnalyzingSanitization
                : t.statusScanningSensitives;
            newProgress += 5;
          } else if (current.progress < 90) {
            newStatus = t.statusGeminiDefensive;
            newProgress += 2;
          }

          return {
            ...prev,
            [currentTab]: {
              ...current,
              progress: newProgress,
              statusText: newStatus,
            },
          };
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [currentModuleState.running, currentTab, t]);

  const handleInitProject = async () => {
    let formattedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
      setTargetUrl(formattedUrl);
    }
    const data = await createProjectApi('Proyecto QA Test', formattedUrl, 'Prueba automatizada');
    if (data.success) {
      updateCurrentModule({ projectId: data.projectId });
      alert(t.projectCreatedAlert);
    }
  };

  const handleRunScanner = async () => {
    if (!currentModuleState.suiteId) return alert(t.suiteRequiredAlert);
    updateCurrentModule({
      progress: 5,
      statusText: t.statusStartingHeadless,
      running: true,
      report: null,
    });

    try {
      const data = await runTestApi(currentModuleState.suiteId, targetUrl);
      if (data.success) {
        updateCurrentModule({
          progress: 95,
          statusText: t.statusGeneratingReport,
        });
        const reportData = await getReportApi(data.runId);
        updateCurrentModule({
          progress: 100,
          report: reportData as ReportData,
          running: false,
        });
      } else {
        alert(t.scanErrorAlert(data.error || 'Fallo desconocido'));
        updateCurrentModule({ progress: 0, running: false });
      }
    } catch (err) {
      alert(t.backendConnErrorAlert((err as Error).message));
      updateCurrentModule({ progress: 0, running: false });
    }
  };

  const handleRunScannerWithInputs = async () => {
    if (!currentModuleState.suiteId) return alert(t.suiteRequiredAlert);
    if (targetInputs.length === 0) {
      alert(t.inputsRequiredAlert);
      return;
    }
    updateCurrentModule({
      progress: 5,
      statusText: t.statusStartingInputs,
      running: true,
      report: null,
    });

    try {
      const data = await runTestApi(currentModuleState.suiteId, targetUrl, targetInputs);
      if (data.success) {
        updateCurrentModule({
          progress: 95,
          statusText: t.statusGeneratingInputReport,
        });
        const reportData = await getReportApi(data.runId);
        updateCurrentModule({
          progress: 100,
          report: reportData as ReportData,
          running: false,
        });
      } else {
        alert(t.scanErrorAlert(data.error || 'Fallo desconocido'));
        updateCurrentModule({ progress: 0, running: false });
      }
    } catch (err) {
      alert(t.backendConnErrorAlert((err as Error).message));
      updateCurrentModule({ progress: 0, running: false });
    }
  };

  const handleResetAnalysis = () => {
    updateCurrentModule(defaultModuleState);
    setTargetInputs([]);
  };

  const isExecutionDisabled = currentModuleState.running || currentModuleState.generatingSuite;

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#040406',
        color: '#fff',
        overflowX: 'hidden',
        paddingBottom: '40px',
      }}
    >
      <CyberBackground />

      <style>{`
        @keyframes pulse-live-dot {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '92%',
          margin: '20px auto',
          padding: '24px',
          fontFamily: 'sans-serif',
          background: 'rgba(6, 8, 15, 0.25)',
          backdropFilter: 'blur(6px)',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          boxSizing: 'border-box',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            marginBottom: currentTab === 'home' ? '24px' : '32px',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(9, 9, 11, 0.5) 100%)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            flexWrap: 'wrap',
            gap: '16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* LOGO E INFORMACIÓN DINÁMICA */}
          <div
            onClick={() => handleNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'opacity 0.15s ease',
              flex: 1,
            }}
            title={t.goHomeTitle}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {/* Ícono de Escudo */}
            <div
              style={{
                width: '46px',
                height: '46px',
                background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.25) 0%, rgba(3, 105, 161, 0.4) 100%)',
                borderRadius: '10px',
                border: '1.5px solid #0284c7',
                boxShadow: '0 0 16px rgba(2, 132, 199, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))' }}>🛡️</span>
            </div>

            {/* Textos de Marca Traducidos */}
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  lineHeight: '1.2',
                }}
              >
                <span style={{ fontWeight: '400', color: '#cbd5e1' }}>{t.headerTitlePrefix}</span>
                <span
                  style={{
                    fontWeight: '900',
                    color: '#38bdf8',
                    textShadow: '0 0 18px rgba(56, 189, 248, 0.35)',
                  }}
                >
                  {t.headerTitleHighlight}
                </span>
              </h1>
              <span
                style={{
                  display: 'block',
                  marginTop: '4px',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  letterSpacing: '1.2px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {t.headerSubtitle}
              </span>
            </div>
          </div>

          {/* INSIGNIAS, SELECTOR DE IDIOMA Y CONTROL DE SESIÓN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {/* SELECTOR ES / EN */}
            <LanguageSelector />

            {/* AUDITORES EN LÍNEA */}
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.15)',
              }}
              title={t.onlineAuditors(onlineUsers)}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                  animation: 'pulse-live-dot 1.8s infinite ease-in-out',
                }}
              />
              <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {t.onlineAuditors(onlineUsers)}
              </span>
            </div>

            <div style={{ background: '#0284c715', padding: '6px 12px', borderRadius: '6px', border: '1px solid #0284c740', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
              <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 'bold' }}>{t.geminiActive}</span>
            </div>

            <div style={{ background: '#16653415', padding: '6px 12px', borderRadius: '6px', border: '1px solid #22c55e40', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 'bold' }}>{t.securedBadge}</span>
            </div>

            {user ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(2, 6, 23, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  boxShadow: '0 0 10px rgba(2, 132, 199, 0.2)',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{user.email}</span>
                
                {user.role === 'ADMIN' ? (
                  <button
                    type="button"
                    onClick={() => handleNavigate('admin')}
                    title={t.adminConsoleTitle}
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#f3e8ff',
                      backgroundColor: 'rgba(147, 51, 234, 0.45)',
                      border: '1px solid #a855f7',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(168, 85, 247, 0.35)',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.7)';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(168, 85, 247, 0.65)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.45)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.35)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>⚙️</span>
                    <span>{t.adminConsoleBtn}</span>
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#38bdf8',
                      backgroundColor: 'rgba(2, 132, 199, 0.25)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {user.role}
                  </span>
                )}

                <button
                  type="button"
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    paddingLeft: '4px',
                  }}
                >
                  {t.logoutBtn}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
              >
                {t.loginBtn}
              </button>
            )}
          </div>
        </header>

        {currentTab !== 'home' && (
          <NavigationTabs activeTab={currentTab} onTabChange={handleNavigate} />
        )}

        {currentTab === 'home' && <HomeTab onNavigate={handleNavigate} />}

        {/* PESTAÑA 1: ESCÁNER GENERAL */}
        {currentTab === 'scanner' && (
          <div>
            <ProjectForm
              targetUrl={targetUrl}
              onTargetUrlChange={setTargetUrl}
              onInitProject={handleInitProject}
              onResetAnalysis={handleResetAnalysis}
              isRunning={isExecutionDisabled}
            />

            {currentModuleState.projectId && (
              <AISuiteGenerator
                projectId={currentModuleState.projectId}
                isScanRunning={isExecutionDisabled}
                promptValue={currentModuleState.prompt}
                selectedPresetValue={currentModuleState.selectedPresetId}
                onPromptChange={(newPrompt: string, presetId: string) =>
                  updateCurrentModule({ prompt: newPrompt, selectedPresetId: presetId })
                }
                onGeneratingChange={(isGenerating: boolean) =>
                  updateCurrentModule({ generatingSuite: isGenerating })
                }
                onSuiteCreated={(id: string) => {
                  updateCurrentModule({ suiteId: id, generatingSuite: false });
                  alert(t.suiteAiConfigured);
                }}
              />
            )}

            {currentModuleState.suiteId && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleRunScanner}
                  disabled={isExecutionDisabled}
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    backgroundColor: isExecutionDisabled
                      ? 'rgba(30, 41, 59, 0.5)'
                      : 'rgba(2, 132, 199, 0.85)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    border: isExecutionDisabled ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid #38bdf8',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    cursor: isExecutionDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isExecutionDisabled ? 'none' : '0 0 16px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.2s ease',
                    opacity: isExecutionDisabled ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExecutionDisabled) {
                      e.currentTarget.style.backgroundColor = '#0284c7';
                      e.currentTarget.style.boxShadow = '0 0 22px rgba(56, 189, 248, 0.55)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExecutionDisabled) {
                      e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.85)';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.35)';
                    }
                  }}
                >
                  {currentModuleState.generatingSuite
                    ? t.btnConfiguringSuite
                    : currentModuleState.running
                    ? t.btnScanningProgress
                    : t.btnRunScanner}
                </button>

                {currentModuleState.running && (
                  <div style={{ width: '100%', marginTop: '12px' }}>
                    <ScanProgressBar progress={currentModuleState.progress} statusText={currentModuleState.statusText} />
                  </div>
                )}
              </div>
            )}

            <ReportViewer report={currentModuleState.report} currentTargetUrl={targetUrl} />
          </div>
        )}

        {/* PESTAÑA 2: MÓDULO DE INYECCIÓN & INPUTS SEC */}
        {currentTab === 'injection' && (
          <div>
            <InputInjectionAuditor
              targetUrl={targetUrl}
              onTargetUrlChange={setTargetUrl}
              targetInputs={targetInputs}
              onTargetInputsChange={setTargetInputs}
              onInitProject={handleInitProject}
              onResetAnalysis={handleResetAnalysis}
              isRunning={isExecutionDisabled}
            />

            {currentModuleState.projectId && (
              <InputSuiteGenerator
                projectId={currentModuleState.projectId}
                isScanRunning={isExecutionDisabled}
                promptValue={currentModuleState.prompt}
                selectedPresetValue={currentModuleState.selectedPresetId}
                onPromptChange={(newPrompt: string, presetId: string) =>
                  updateCurrentModule({ prompt: newPrompt, selectedPresetId: presetId })
                }
                onGeneratingChange={(isGenerating: boolean) =>
                  updateCurrentModule({ generatingSuite: isGenerating })
                }
                onSuiteCreated={(id: string) => {
                  updateCurrentModule({ suiteId: id, generatingSuite: false });
                  alert(t.suiteAiInputsConfigured);
                }}
              />
            )}

            {currentModuleState.suiteId && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleRunScannerWithInputs}
                  disabled={isExecutionDisabled}
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    backgroundColor: isExecutionDisabled
                      ? 'rgba(30, 41, 59, 0.5)'
                      : 'rgba(2, 132, 199, 0.85)',
                    color: '#ffffff',
                    padding: '12px 24px',
                    border: isExecutionDisabled ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid #38bdf8',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    cursor: isExecutionDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isExecutionDisabled ? 'none' : '0 0 16px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.2s ease',
                    opacity: isExecutionDisabled ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExecutionDisabled) {
                      e.currentTarget.style.backgroundColor = '#0284c7';
                      e.currentTarget.style.boxShadow = '0 0 22px rgba(56, 189, 248, 0.55)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExecutionDisabled) {
                      e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.85)';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.35)';
                    }
                  }}
                >
                  {currentModuleState.generatingSuite
                    ? t.btnConfiguringSuite
                    : currentModuleState.running
                    ? t.btnAuditingInputsProgress
                    : t.btnRunInputAudit}
                </button>

                {currentModuleState.running && (
                  <div style={{ width: '100%', marginTop: '12px' }}>
                    <ScanProgressBar progress={currentModuleState.progress} statusText={currentModuleState.statusText} />
                  </div>
                )}
              </div>
            )}

            <ReportViewer report={currentModuleState.report} currentTargetUrl={targetUrl} />
          </div>
        )}

        {/* PESTAÑA 3: AUDITORÍA DEFENSIVA DE CONFIGURACIÓN DE RED */}
        {currentTab === 'network' && (
          <NetworkConfigAuditor
            networkData={{
              targetHost: currentModuleState.prompt || 'portquiz.net',
              services: currentModuleState.services || [],
              analysis: currentModuleState.analysis || null,
            }}
            onUpdateNetworkData={(data) => {
              updateCurrentModule({
                prompt: data.targetHost !== undefined ? data.targetHost : currentModuleState.prompt,
                ...(data.services !== undefined ? { services: data.services } : {}),
                ...(data.analysis !== undefined ? { analysis: data.analysis } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 4: CVE RADAR */}
        {currentTab === 'cve' && (
          <CveRadarTab
            cveData={{
              vulnerabilities: currentModuleState.vulnerabilities || [],
              selectedKeyword: currentModuleState.prompt || '',
              selectedStartDate: currentModuleState.startDate,
              selectedEndDate: currentModuleState.endDate,
              activeCveId: currentModuleState.activeCveId || '',
              aiAnalysis: currentModuleState.aiAnalysis || null,
            }}
            onUpdateCveData={(data) => {
              updateCurrentModule({
                prompt: data.selectedKeyword !== undefined ? data.selectedKeyword : currentModuleState.prompt,
                vulnerabilities: data.vulnerabilities !== undefined ? data.vulnerabilities : currentModuleState.vulnerabilities,
                startDate: data.selectedStartDate !== undefined ? data.selectedStartDate : currentModuleState.startDate,
                endDate: data.selectedEndDate !== undefined ? data.selectedEndDate : currentModuleState.endDate,
                activeCveId: data.activeCveId !== undefined ? data.activeCveId : currentModuleState.activeCveId,
                aiAnalysis: data.aiAnalysis !== undefined ? data.aiAnalysis : currentModuleState.aiAnalysis,
              });
            }}
          />
        )}

        {/* PESTAÑA 5: SAST & CODE AUDIT */}
        {currentTab === 'sast' && (
          <SastAuditTab
            sastData={{
              fileName: currentModuleState.sastFileName || 'snippet.ts',
              result: currentModuleState.sastResult || null,
              codeSnippet: currentModuleState.sastCodeSnippet || '',
              language: currentModuleState.sastLanguage || 'typescript',
              showDiffModal: currentModuleState.sastShowDiffModal || false,
            }}
            onUpdateSastData={(data) => {
              updateCurrentModule({
                ...(data.fileName !== undefined ? { sastFileName: data.fileName } : {}),
                ...(data.result !== undefined ? { sastResult: data.result } : {}),
                ...(data.codeSnippet !== undefined ? { sastCodeSnippet: data.codeSnippet } : {}),
                ...(data.language !== undefined ? { sastLanguage: data.language } : {}),
                ...(data.showDiffModal !== undefined ? { sastShowDiffModal: data.showDiffModal } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 6: CARGA & DOS */}
        {currentTab === 'load-test' && (
          <LoadTestTab
            loadTestData={{
              config: currentModuleState.loadTestConfig,
              result: currentModuleState.loadTestResult || null,
            }}
            onUpdateLoadTestData={(data) => {
              updateCurrentModule({
                ...(data.config !== undefined ? { loadTestConfig: data.config } : {}),
                ...(data.result !== undefined ? { loadTestResult: data.result } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 7: DAST API */}
        {currentTab === 'dast' && (
          <DastAuditTab
            dastData={{
              targetBaseUrl: currentModuleState.dastTargetBaseUrl || '',
              openApiSpecJson: currentModuleState.dastOpenApiSpecJson || '',
              primaryAuthHeader: currentModuleState.dastPrimaryAuthHeader || '',
              secondaryAuthHeader: currentModuleState.dastSecondaryAuthHeader || '',
              enableBolaTesting: currentModuleState.dastEnableBolaTesting ?? true,
              enableHeaderInjectionTesting: currentModuleState.dastEnableHeaderInjectionTesting ?? true,
              auditResult: currentModuleState.dastAuditResult || null,
            }}
            onUpdateDastData={(data) => {
              updateCurrentModule({
                ...(data.targetBaseUrl !== undefined ? { dastTargetBaseUrl: data.targetBaseUrl } : {}),
                ...(data.openApiSpecJson !== undefined ? { dastOpenApiSpecJson: data.openApiSpecJson } : {}),
                ...(data.primaryAuthHeader !== undefined ? { dastPrimaryAuthHeader: data.primaryAuthHeader } : {}),
                ...(data.secondaryAuthHeader !== undefined ? { dastSecondaryAuthHeader: data.secondaryAuthHeader } : {}),
                ...(data.enableBolaTesting !== undefined ? { dastEnableBolaTesting: data.enableBolaTesting } : {}),
                ...(data.enableHeaderInjectionTesting !== undefined ? { dastEnableHeaderInjectionTesting: data.enableHeaderInjectionTesting } : {}),
                ...(data.auditResult !== undefined ? { dastAuditResult: data.auditResult } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 8: SCA & SUPPLY CHAIN */}
        {currentTab === 'sca' && (
          <ScaAuditTab
            scaData={{
              manifestType: currentModuleState.scaManifestType || 'package_json',
              manifestContent: currentModuleState.scaManifestContent || '',
              enableDependencyScan: currentModuleState.scaEnableDependencyScan ?? true,
              enableGitHistoryScan: currentModuleState.scaEnableGitHistoryScan ?? true,
              auditResult: currentModuleState.scaAuditResult || null,
            }}
            onUpdateScaData={(data) => {
              updateCurrentModule({
                ...(data.manifestType !== undefined ? { scaManifestType: data.manifestType } : {}),
                ...(data.manifestContent !== undefined ? { scaManifestContent: data.manifestContent } : {}),
                ...(data.enableDependencyScan !== undefined ? { scaEnableDependencyScan: data.enableDependencyScan } : {}),
                ...(data.enableGitHistoryScan !== undefined ? { scaEnableGitHistoryScan: data.enableGitHistoryScan } : {}),
                ...(data.auditResult !== undefined ? { scaAuditResult: data.auditResult } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 9: EASM OSINT */}
        {currentTab === 'easm' && (
          <EasmAuditTab
            easmData={{
              targetDomain: currentModuleState.easmTargetDomain || '',
              enableSubdomainDiscovery: currentModuleState.easmEnableSubdomainDiscovery ?? true,
              enableWafTechDetection: currentModuleState.easmEnableWafTechDetection ?? true,
              enableSslAudit: currentModuleState.easmEnableSslAudit ?? true,
              result: currentModuleState.easmResult || null,
            }}
            onUpdateEasmData={(data) => {
              updateCurrentModule({
                ...(data.targetDomain !== undefined ? { easmTargetDomain: data.targetDomain } : {}),
                ...(data.enableSubdomainDiscovery !== undefined ? { easmEnableSubdomainDiscovery: data.enableSubdomainDiscovery } : {}),
                ...(data.enableWafTechDetection !== undefined ? { easmEnableWafTechDetection: data.enableWafTechDetection } : {}),
                ...(data.enableSslAudit !== undefined ? { easmEnableSslAudit: data.enableSslAudit } : {}),
                ...(data.result !== undefined ? { easmResult: data.result } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 10: RED TEAM */}
        {currentTab === 'redteam' && (
          <RedTeamAuditTab
            redTeamData={{
              targetUrl: currentModuleState.redTeamTargetUrl || '',
              jwtToken: currentModuleState.redTeamJwtToken || '',
              enableJwt: currentModuleState.redTeamEnableJwt ?? true,
              enableCors: currentModuleState.redTeamEnableCors ?? true,
              result: currentModuleState.redTeamResult || null,
            }}
            onUpdateRedTeamData={(data) => {
              updateCurrentModule({
                ...(data.targetUrl !== undefined ? { redTeamTargetUrl: data.targetUrl } : {}),
                ...(data.jwtToken !== undefined ? { redTeamJwtToken: data.jwtToken } : {}),
                ...(data.enableJwt !== undefined ? { redTeamEnableJwt: data.enableJwt } : {}),
                ...(data.enableCors !== undefined ? { redTeamEnableCors: data.enableCors } : {}),
                ...(data.result !== undefined ? { redTeamResult: data.result } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 11: EMAIL SECURITY */}
        {currentTab === 'emailsec' && (
          <EmailSecAuditTab
            emailSecData={{
              activeSubTab: currentModuleState.emailSecActiveSubTab || 'domain',
              domain: currentModuleState.emailSecDomain || '',
              dkimSelector: currentModuleState.emailSecDkimSelector || 'google',
              targetIp: currentModuleState.emailSecTargetIp || '',
              rawHeaders: currentModuleState.emailSecRawHeaders || '',
              result: currentModuleState.emailSecResult || null,
            }}
            onUpdateEmailSecData={(data) => {
              updateCurrentModule({
                ...(data.activeSubTab !== undefined ? { emailSecActiveSubTab: data.activeSubTab } : {}),
                ...(data.domain !== undefined ? { emailSecDomain: data.domain } : {}),
                ...(data.dkimSelector !== undefined ? { emailSecDkimSelector: data.dkimSelector } : {}),
                ...(data.targetIp !== undefined ? { emailSecTargetIp: data.targetIp } : {}),
                ...(data.rawHeaders !== undefined ? { emailSecRawHeaders: data.rawHeaders } : {}),
                ...(data.result !== undefined ? { emailSecResult: data.result } : {}),
              });
            }}
          />
        )}

        {/* PESTAÑA 12: COMPLIANCE RADAR */}
        {currentTab === 'compliance' && (
          <ComplianceRadarTab
            complianceData={{
              selectedTarget: currentModuleState.complianceSelectedTarget || '',
              customTargetInput: currentModuleState.complianceCustomTargetInput || '',
              radarDataResponse: currentModuleState.complianceRadarDataResponse || null,
            }}
            onUpdateComplianceData={(data) => {
              updateCurrentModule({
                ...(data.selectedTarget !== undefined ? { complianceSelectedTarget: data.selectedTarget } : {}),
                ...(data.customTargetInput !== undefined ? { complianceCustomTargetInput: data.customTargetInput } : {}),
                ...(data.radarDataResponse !== undefined ? { complianceRadarDataResponse: data.radarDataResponse } : {}),
              });
            }}
          />
        )}

        {/* RESTO DE MÓDULOS */}
        {currentTab === 'history' && <ReportHistory />}

        {/* PESTAÑA ADMIN RBAC */}
        {currentTab === 'admin' && user?.role === 'ADMIN' && <AdminDashboardTab />}
      </div>

      {/* MODAL GLOBAL DE LOGIN / OTP */}
      <LoginOtpModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default App;