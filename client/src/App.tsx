import { useState, useEffect } from 'react';
import { createProjectApi, runTestApi, getReportApi } from './services/api.client';
import { AISuiteGenerator } from './components/AISuiteGenerator';
import { InputSuiteGenerator } from './components/InputSuiteGenerator';
import { ReportViewer, type ReportData } from './components/ReportViewer';
import { ReportHistory } from './components/ReportHistory';
import { NetworkConfigAuditor } from './components/NetworkConfigAuditor';

import { NavigationTabs, type TabType } from './components/dashboard/NavigationTabs';
import { ProjectForm } from './components/dashboard/ProjectForm';
import { InputInjectionAuditor } from './components/dashboard/InputInjectionAuditor';
import { ScanProgressBar } from './components/dashboard/ScanProgressBar';
import type { TargetInput } from './components/dashboard/dashboard.types';
import { CveRadarTab } from './components/cve/CveRadarTab';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
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

  // Ejecución para la Pestaña 1 (Escáner General)
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

  // Ejecución para la Pestaña 2 (Inyección & Inputs Sec)
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
        width: '92%',
        margin: '20px auto',
        padding: '24px',
        fontFamily: 'sans-serif',
        background: '#121212',
        color: '#fff',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ marginTop: 0, textAlign: 'center', marginBottom: '40px' }}>
        🛡️ QA-Sec Suite Dashboard
      </h1>

      {/* MENÚ DE PESTAÑAS */}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={handleRunScanner}
                disabled={running}
                style={{
                  width: '100%',
                  background: running ? '#374151' : '#2563eb',
                  color: '#fff',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: running ? 'not-allowed' : 'pointer',
                  opacity: running ? 0.7 : 1,
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
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={handleRunScannerWithInputs}
                disabled={running}
                style={{
                  width: '100%',
                  background: running ? '#374151' : '#2563eb',
                  color: '#fff',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: running ? 'not-allowed' : 'pointer',
                  opacity: running ? 0.7 : 1,
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

      {/* PESTAÑA 4: Vulnerabilides actuales */}
      {activeTab === 'cve' && <CveRadarTab />}

      {/* PESTAÑA 5: HISTORIAL Y BUSCADOR */}
      {activeTab === 'history' && <ReportHistory />}
    </div>
  );
}

export default App;