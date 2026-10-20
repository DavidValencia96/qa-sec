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

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [targetUrl, setTargetUrl] = useState('https://www.google.com/');
  const [targetInputs, setTargetInputs] = useState<TargetInput[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [suiteId, setSuiteId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (running) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) {
            setStatusText(
              activeTab === 'injection'
                ? 'Localizando campos objetivo en el DOM con Playwright...'
                : 'Interceptando tráfico de red y encabezados HTTP...'
            );
            return prev + 5;
          } else if (prev < 65) {
            setStatusText(
              activeTab === 'injection'
                ? 'Analizando tipos de datos, atributos de sanitización y respuestas...'
                : 'Escaneando archivos sensibles y configuraciones...'
            );
            return prev + 5;
          } else if (prev < 90) {
            setStatusText('Analizando respuestas y ejecutando análisis defensivo con Gemini...');
            return prev + 2;
          }
          return prev;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [running, activeTab]);

  const handleInitProject = async () => {
    let formattedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
      setTargetUrl(formattedUrl);
    }
    const data = await createProjectApi('Proyecto QA Test', formattedUrl, 'Prueba automatizada');
    if (data.success) {
      setProjectId(data.projectId);
      alert('Proyecto inicializado correctamente en MySQL.');
    }
  };

  const handleRunScanner = async () => {
    if (!suiteId) return alert('Debes generar o seleccionar una suite primero.');
    setProgress(5);
    setStatusText('Iniciando navegador headless (Playwright)...');
    setRunning(true);
    setReport(null);

    try {
      const data = await runTestApi(suiteId, targetUrl);
      if (data.success) {
        setProgress(95);
        setStatusText('Generando reporte técnico...');
        const reportData = await getReportApi(data.runId);
        setProgress(100);
        setReport(reportData as ReportData);
      } else {
        alert(`Error durante la ejecución del escáner: ${data.error || 'Fallo desconocido'}`);
        setProgress(0);
      }
    } catch (err) {
      alert(`Error de conexión con el backend: ${(err as Error).message}`);
      setProgress(0);
    } finally {
      setRunning(false);
    }
  };

  const handleRunScannerWithInputs = async () => {
    if (!suiteId) return alert('Debes generar o seleccionar una suite primero.');
    if (targetInputs.length === 0) {
      alert('Por favor agrega al menos un campo/localizador (ID, Name, XPath o CSS) para auditar.');
      return;
    }
    setProgress(5);
    setStatusText('Iniciando navegador e interactuando con los campos objetivo...');
    setRunning(true);
    setReport(null);

    try {
      const data = await runTestApi(suiteId, targetUrl, targetInputs);
      if (data.success) {
        setProgress(95);
        setStatusText('Generando reporte técnico de sanitización...');
        const reportData = await getReportApi(data.runId);
        setProgress(100);
        setReport(reportData as ReportData);
      } else {
        alert(`Error durante la ejecución del análisis de inputs: ${data.error || 'Fallo desconocido'}`);
        setProgress(0);
      }
    } catch (err) {
      alert(`Error de conexión con el backend: ${(err as Error).message}`);
      setProgress(0);
    } finally {
      setRunning(false);
    }
  };

  const handleResetAnalysis = () => {
    setRunning(false);
    setProgress(0);
    setStatusText('');
    setReport(null);
    setSuiteId(null);
    setProjectId(null);
    setTargetInputs([]);
  };

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
      {/* FONDO DINÁMICO DE RED DE NODOS */}
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
        {/* HEADER CIBERNÉTICO FUTURISTA */}
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

        {/* MENÚ DE PESTAÑAS (SÓLO VISIBLE FUERA DEL HOME) */}
        {activeTab !== 'home' && (
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {/* PESTAÑA INICIAL: HOME / LANDING PAGE */}
        {activeTab === 'home' && <HomeTab onNavigate={(tab) => setActiveTab(tab)} />}

        {/* PESTAÑA 1: ESCÁNER GENERAL Y DISEÑADOR IA */}
        {activeTab === 'scanner' && (
          <div>
            <ProjectForm
              targetUrl={targetUrl}
              onTargetUrlChange={setTargetUrl}
              onInitProject={handleInitProject}
              onResetAnalysis={handleResetAnalysis}
              isRunning={running}
            />

            {projectId && (
              <AISuiteGenerator
                projectId={projectId}
                isScanRunning={running}
                onSuiteCreated={(id: string) => {
                  setSuiteId(id);
                  alert('Suite configurada por Gemini AI y lista para ejecutar.');
                }}
              />
            )}

            {suiteId && (
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleRunScanner}
                  disabled={running}
                  style={{
                    width: '100%',
                    background: running
                      ? 'rgba(51, 65, 85, 0.6)'
                      : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '14px 24px',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: running ? 'not-allowed' : 'pointer',
                    boxShadow: running ? 'none' : '0 0 20px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {running ? 'Escaneando en progreso...' : '🚀 Ejecutar Pruebas de Seguridad'}
                </button>

                {running && <ScanProgressBar progress={progress} statusText={statusText} />}
              </div>
            )}

            <ReportViewer report={report} currentTargetUrl={targetUrl} />
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
              isRunning={running}
            />

            {projectId && (
              <InputSuiteGenerator
                projectId={projectId}
                isScanRunning={running}
                onSuiteCreated={(id: string) => {
                  setSuiteId(id);
                  alert('Suite de prueba de inputs configurada por Gemini AI.');
                }}
              />
            )}

            {suiteId && (
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleRunScannerWithInputs}
                  disabled={running}
                  style={{
                    width: '100%',
                    background: running
                      ? 'rgba(51, 65, 85, 0.6)'
                      : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '14px 24px',
                    border: '1px solid #38bdf8',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: running ? 'not-allowed' : 'pointer',
                    boxShadow: running ? 'none' : '0 0 20px rgba(56, 189, 248, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {running ? 'Auditando Inputs...' : '🚀 Ejecutar Auditoría de Inputs'}
                </button>

                {running && <ScanProgressBar progress={progress} statusText={statusText} />}
              </div>
            )}

            <ReportViewer report={report} currentTargetUrl={targetUrl} />
          </div>
        )}

        {/* PESTAÑA 3: AUDITORÍA DEFENSIVA DE CONFIGURACIÓN DE RED */}
        {activeTab === 'network' && <NetworkConfigAuditor />}

        {/* PESTAÑA 4: Vulnerabilidades actuales */}
        {activeTab === 'cve' && <CveRadarTab />}

        {/* PESTAÑA 5: Auditoría SAST & Secret Scanning */}
        {activeTab === 'sast' && <SastAuditTab />}

        {/* PESTAÑA 6: Pruebas de Carga & DoS */}
        {activeTab === 'load-test' && <LoadTestTab />}

        {/* PESTAÑA 7: DAST & OpenAPI Fuzzer */}
        {activeTab === 'dast' && <DastAuditTab />}

        {/* PESTAÑA 8: SCA & Supply Chain Security */}
        {activeTab === 'sca' && <ScaAuditTab />}

        {/* PESTAÑA 9: EASM & OSINT */}
        {activeTab === 'easm' && <EasmAuditTab />}

        {/* PESTAÑA 10: Red Team & Explotación */}
        {activeTab === 'redteam' && <RedTeamAuditTab />}

        {/* PESTAÑA 11: Email Security & OSINT */}
        {activeTab === 'emailsec' && <EmailSecAuditTab />}

        {/* PESTAÑA 12: Compliance Radar */}
        {activeTab === 'compliance' && <ComplianceRadarTab />}

        {/* PESTAÑA 13: HISTORIAL Y BUSCADOR */}
        {activeTab === 'history' && <ReportHistory />}
      </div>
    </div>
  );
}

export default App;