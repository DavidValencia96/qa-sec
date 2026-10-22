import { useState, useEffect } from 'react';
import {
  createProjectApi,
  runTestApi,
  getReportApi,
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
import { CyberBackground } from './components/ui/CyberBackground';
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
  // Memoria Red
  services?: ServiceItem[];
  analysis?: NetworkAnalysis | null;
  // Memoria CVE Radar
  vulnerabilities?: CveItem[];
  activeCveId?: string;
  aiAnalysis?: CveAiAnalysis | null;
  startDate?: string;
  endDate?: string;
  // Memoria SAST & Code
  sastResult?: SastAnalysisResponse | null;
  sastCodeSnippet?: string;
  sastFileName?: string;
  sastLanguage?: string;
  sastShowDiffModal?: boolean;
  // Memoria Carga & DoS
  loadTestResult?: LoadTestResult | null;
  loadTestConfig?: LoadTestConfig;
  // Memoria DAST API
  dastTargetBaseUrl?: string;
  dastOpenApiSpecJson?: string;
  dastPrimaryAuthHeader?: string;
  dastSecondaryAuthHeader?: string;
  dastEnableBolaTesting?: boolean;
  dastEnableHeaderInjectionTesting?: boolean;
  dastAuditResult?: DastAuditResponse | null;
  // Memoria SCA & Supply Chain
  scaManifestType?: DependencyManifestType;
  scaManifestContent?: string;
  scaEnableDependencyScan?: boolean;
  scaEnableGitHistoryScan?: boolean;
  scaAuditResult?: ScaAuditResponse | null;
  // Memoria EASM
  easmTargetDomain?: string;
  easmEnableSubdomainDiscovery?: boolean;
  easmEnableWafTechDetection?: boolean;
  easmEnableSslAudit?: boolean;
  easmResult?: EasmAuditResult | null;
  // Memoria Red Team
  redTeamTargetUrl?: string;
  redTeamJwtToken?: string;
  redTeamEnableJwt?: boolean;
  redTeamEnableCors?: boolean;
  redTeamResult?: RedTeamAuditResult | null;
  // Memoria Email Security
  emailSecActiveSubTab?: 'domain' | 'ip' | 'headers';
  emailSecDomain?: string;
  emailSecDkimSelector?: string;
  emailSecTargetIp?: string;
  emailSecRawHeaders?: string;
  emailSecResult?: EmailSecResultState | null;
  // Memoria Compliance Radar
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
  dastTargetBaseUrl: 'http://localhost:3000/api',
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
  easmTargetDomain: 'google.com',
  easmEnableSubdomainDiscovery: true,
  easmEnableWafTechDetection: true,
  easmEnableSslAudit: true,
  easmResult: null,
  redTeamTargetUrl: 'http://localhost:3000/api/users',
  redTeamJwtToken: '',
  redTeamEnableJwt: true,
  redTeamEnableCors: true,
  redTeamResult: null,
  emailSecActiveSubTab: 'domain',
  emailSecDomain: 'google.com',
  emailSecDkimSelector: 'google',
  emailSecTargetIp: '',
  emailSecRawHeaders: '',
  emailSecResult: null,
  complianceSelectedTarget: '',
  complianceCustomTargetInput: '',
  complianceRadarDataResponse: null,
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [targetUrl, setTargetUrl] = useState('https://www.google.com/');
  const [targetInputs, setTargetInputs] = useState<TargetInput[]>([]);

  const [modulesData, setModulesData] = useState<Record<string, ModuleState>>({});

  const currentModuleState = modulesData[activeTab] || defaultModuleState;

  const updateCurrentModule = (patch: Partial<ModuleState>) => {
    setModulesData((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || defaultModuleState),
        ...patch,
      },
    }));
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentModuleState.running) {
      interval = setInterval(() => {
        setModulesData((prev) => {
          const current = prev[activeTab] || defaultModuleState;
          if (!current.running) return prev;

          let newProgress = current.progress;
          let newStatus = current.statusText;

          if (current.progress < 30) {
            newStatus =
              activeTab === 'injection'
                ? 'Localizando campos objetivo en el DOM con Playwright...'
                : 'Interceptando tráfico de red y encabezados HTTP...';
            newProgress += 5;
          } else if (current.progress < 65) {
            newStatus =
              activeTab === 'injection'
                ? 'Analizando tipos de datos, atributos de sanitización y respuestas...'
                : 'Escaneando archivos sensibles y configuraciones...';
            newProgress += 5;
          } else if (current.progress < 90) {
            newStatus = 'Analizando respuestas y ejecutando análisis defensivo con Gemini...';
            newProgress += 2;
          }

          return {
            ...prev,
            [activeTab]: {
              ...current,
              progress: newProgress,
              statusText: newStatus,
            },
          };
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [currentModuleState.running, activeTab]);

  const handleInitProject = async () => {
    let formattedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
      setTargetUrl(formattedUrl);
    }
    const data = await createProjectApi('Proyecto QA Test', formattedUrl, 'Prueba automatizada');
    if (data.success) {
      updateCurrentModule({ projectId: data.projectId });
      alert('Proyecto inicializado correctamente en MySQL.');
    }
  };

  const handleRunScanner = async () => {
    if (!currentModuleState.suiteId) return alert('Debes generar o seleccionar una suite primero.');
    updateCurrentModule({
      progress: 5,
      statusText: 'Iniciando navegador headless (Playwright)...',
      running: true,
      report: null,
    });

    try {
      const data = await runTestApi(currentModuleState.suiteId, targetUrl);
      if (data.success) {
        updateCurrentModule({
          progress: 95,
          statusText: 'Generando reporte técnico...',
        });
        const reportData = await getReportApi(data.runId);
        updateCurrentModule({
          progress: 100,
          report: reportData as ReportData,
          running: false,
        });
      } else {
        alert(`Error durante la ejecución del escáner: ${data.error || 'Fallo desconocido'}`);
        updateCurrentModule({ progress: 0, running: false });
      }
    } catch (err) {
      alert(`Error de conexión con el backend: ${(err as Error).message}`);
      updateCurrentModule({ progress: 0, running: false });
    }
  };

  const handleRunScannerWithInputs = async () => {
    if (!currentModuleState.suiteId) return alert('Debes generar o seleccionar una suite primero.');
    if (targetInputs.length === 0) {
      alert('Por favor agrega al menos un campo/localizador (ID, Name, XPath o CSS) para auditar.');
      return;
    }
    updateCurrentModule({
      progress: 5,
      statusText: 'Iniciando navegador e interactuando con los campos objetivo...',
      running: true,
      report: null,
    });

    try {
      const data = await runTestApi(currentModuleState.suiteId, targetUrl, targetInputs);
      if (data.success) {
        updateCurrentModule({
          progress: 95,
          statusText: 'Generando reporte técnico de sanitización...',
        });
        const reportData = await getReportApi(data.runId);
        updateCurrentModule({
          progress: 100,
          report: reportData as ReportData,
          running: false,
        });
      } else {
        alert(`Error durante la ejecución del análisis de inputs: ${data.error || 'Fallo desconocido'}`);
        updateCurrentModule({ progress: 0, running: false });
      }
    } catch (err) {
      alert(`Error de conexión con el backend: ${(err as Error).message}`);
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
            marginBottom: activeTab === 'home' ? '24px' : '32px',
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
          {/* LOGO E INFORMACIÓN (A LA IZQUIERDA) */}
          <div
            onClick={() => setActiveTab('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'opacity 0.15s ease',
              flex: 1, // Empuja el contenido restante hacia la derecha
            }}
            title="Ir a Inicio"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <div
              style={{
                background: 'radial-gradient(circle, #2563eb 0%, #0f172a 100%)',
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #38bdf8',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>🛡️</span>
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 50%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                QA-SEC <span style={{ fontWeight: '300', color: '#94a3b8', WebkitTextFillColor: '#94a3b8' }}>SUITE</span>
              </h1>
              <span style={{ color: '#64748b', fontSize: '0.78rem', letterSpacing: '1px', fontWeight: '600', textTransform: 'uppercase' }}>
                AI-Powered DevSecOps & Audit Platform
              </span>
            </div>
          </div>

          {/* INSIGNIAS (AL EXTREMO DERECHO) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            <div style={{ background: '#0284c715', padding: '6px 12px', borderRadius: '6px', border: '1px solid #0284c740', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
              <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 'bold' }}>v3.x • Gemini Active</span>
            </div>

            <div style={{ background: '#16653415', padding: '6px 12px', borderRadius: '6px', border: '1px solid #22c55e40', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 'bold' }}>Secured</span>
            </div>
          </div>
        </header>

        {activeTab !== 'home' && (
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}

        {/* PESTAÑA 1: ESCÁNER GENERAL */}
        {activeTab === 'scanner' && (
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
                  alert('Suite configurada por Gemini AI y lista para ejecutar.');
                }}
              />
            )}

            {currentModuleState.suiteId && (
              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleRunScanner}
                  disabled={isExecutionDisabled}
                  style={{
                    width: '100%',
                    background: isExecutionDisabled
                      ? 'rgba(51, 65, 85, 0.6)'
                      : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '14px 24px',
                    border: isExecutionDisabled ? '1px solid #475569' : '1px solid #38bdf8',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: isExecutionDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isExecutionDisabled ? 'none' : '0 0 20px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.2s ease',
                    opacity: isExecutionDisabled ? 0.6 : 1,
                  }}
                >
                  {currentModuleState.generatingSuite
                    ? '⏳ Espere, configurando suite con Gemini AI...'
                    : currentModuleState.running
                    ? 'Escaneando en progreso...'
                    : '🚀 Ejecutar Pruebas de Seguridad'}
                </button>

                {currentModuleState.running && (
                  <ScanProgressBar progress={currentModuleState.progress} statusText={currentModuleState.statusText} />
                )}
              </div>
            )}

            <ReportViewer report={currentModuleState.report} currentTargetUrl={targetUrl} />
          </div>
        )}

        {/* PESTAÑA 2: MÓDULO DE INYECCIÓN & INPUTS SEC */}
        {activeTab === 'injection' && (
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
                  alert('Suite de prueba de inputs configurada por Gemini AI.');
                }}
              />
            )}

            {currentModuleState.suiteId && (
              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleRunScannerWithInputs}
                  disabled={isExecutionDisabled}
                  style={{
                    width: '100%',
                    background: isExecutionDisabled
                      ? 'rgba(51, 65, 85, 0.6)'
                      : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '14px 24px',
                    border: isExecutionDisabled ? '1px solid #475569' : '1px solid #38bdf8',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: isExecutionDisabled ? 'not-allowed' : 'pointer',
                    boxShadow: isExecutionDisabled ? 'none' : '0 0 20px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.2s ease',
                    opacity: isExecutionDisabled ? 0.6 : 1,
                  }}
                >
                  {currentModuleState.generatingSuite
                    ? '⏳ Espere, configurando suite con Gemini AI...'
                    : currentModuleState.running
                    ? 'Auditando Inputs...'
                    : '🚀 Ejecutar Auditoría de Inputs'}
                </button>

                {currentModuleState.running && (
                  <ScanProgressBar progress={currentModuleState.progress} statusText={currentModuleState.statusText} />
                )}
              </div>
            )}

            <ReportViewer report={currentModuleState.report} currentTargetUrl={targetUrl} />
          </div>
        )}

        {/* PESTAÑA 3: AUDITORÍA DEFENSIVA DE CONFIGURACIÓN DE RED */}
        {activeTab === 'network' && (
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
        {activeTab === 'cve' && (
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
        {activeTab === 'sast' && (
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
        {activeTab === 'load-test' && (
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
        {activeTab === 'dast' && (
          <DastAuditTab
            dastData={{
              targetBaseUrl: currentModuleState.dastTargetBaseUrl || 'http://localhost:3000/api',
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
        {activeTab === 'sca' && (
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
        {activeTab === 'easm' && (
          <EasmAuditTab
            easmData={{
              targetDomain: currentModuleState.easmTargetDomain || 'google.com',
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
        {activeTab === 'redteam' && (
          <RedTeamAuditTab
            redTeamData={{
              targetUrl: currentModuleState.redTeamTargetUrl || 'http://localhost:3000/api/users',
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
        {activeTab === 'emailsec' && (
          <EmailSecAuditTab
            emailSecData={{
              activeSubTab: currentModuleState.emailSecActiveSubTab || 'domain',
              domain: currentModuleState.emailSecDomain || 'google.com',
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
        {activeTab === 'compliance' && (
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
        {activeTab === 'history' && <ReportHistory />}
      </div>
    </div>
  );
}

export default App;