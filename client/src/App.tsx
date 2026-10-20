import { useState, useEffect } from 'react';
import { createProjectApi, runTestApi, getReportApi } from './services/api.client';
import { AISuiteGenerator } from './components/AISuiteGenerator';
import { InputSuiteGenerator } from './components/InputSuiteGenerator';
import { ReportViewer, type ReportData } from './components/ReportViewer';
import { ReportHistory } from './components/ReportHistory';
import { NetworkConfigAuditor } from './components/NetworkConfigAuditor';

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
import { EasmAuditTab } from './components/EasmAuditTab';
import { RedTeamAuditTab } from './components/redteam/RedTeamAuditTab';
import { EmailSecAuditTab } from './components/EmailSecAuditTab';
import { ComplianceRadarTab } from './components/compliance/ComplianceRadarTab';
import { CyberBackground } from './components/ui/CyberBackground';

interface ModuleState {
  projectId: string | null;
  suiteId: string | null;
  prompt: string;
  selectedPresetId: string;
  report: ReportData | null;
  running: boolean;
  generatingSuite: boolean; // Estado para bloquear ejecuciones mientras la IA genera la suite
  progress: number;
  statusText: string;
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

  // Variable de apoyo para deshabilitar botones si la IA o la prueba están activas
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* RESTO DE MÓDULOS */}
        {activeTab === 'network' && <NetworkConfigAuditor />}
        {activeTab === 'cve' && <CveRadarTab />}
        {activeTab === 'sast' && <SastAuditTab />}
        {activeTab === 'load-test' && <LoadTestTab />}
        {activeTab === 'dast' && <DastAuditTab />}
        {activeTab === 'sca' && <ScaAuditTab />}
        {activeTab === 'easm' && <EasmAuditTab />}
        {activeTab === 'redteam' && <RedTeamAuditTab />}
        {activeTab === 'emailsec' && <EmailSecAuditTab />}
        {activeTab === 'compliance' && <ComplianceRadarTab />}
        {activeTab === 'history' && <ReportHistory />}
      </div>
    </div>
  );
}

export default App;