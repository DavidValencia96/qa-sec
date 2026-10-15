import { useState, useEffect } from 'react';
import { createProjectApi, runTestApi, getReportApi } from './services/api.client';
import { AISuiteGenerator } from './components/AISuiteGenerator';
import { ReportViewer, type ReportData } from './components/ReportViewer';
import { ReportHistory } from './components/ReportHistory';
import { NetworkConfigAuditor } from './components/NetworkConfigAuditor';

import { NavigationTabs, type TabType } from './components/dashboard/NavigationTabs';
import { ProjectForm } from './components/dashboard/ProjectForm';
import { ScanProgressBar } from './components/dashboard/ScanProgressBar';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [targetUrl, setTargetUrl] = useState('https://www.URL.co/');
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
            setStatusText('Interceptando tráfico de red y encabezados HTTP...');
            return prev + 5;
          } else if (prev < 65) {
            setStatusText('Escaneando archivos sensibles (.env, .git, config)...');
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
  }, [running]);

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

  // Función para cancelar la ejecución y restablecer la interfaz para un nuevo análisis
  const handleResetAnalysis = () => {
    setRunning(false);
    setProgress(0);
    setStatusText('');
    setReport(null);
    setSuiteId(null);
    setProjectId(null);
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
        boxSizing: 'border-box'
      }}
    >
      <h1 style={{ marginTop: 0, textAlign: 'center', marginBottom: '50px' }}>🛡️ QA-Sec Suite Dashboard</h1>

      {/* MENÚ DE PESTAÑAS */}
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* PESTAÑA 1: ESCÁNER Y DISEÑADOR IA */}
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

      {/* PESTAÑA 2: AUDITORÍA DEFENSIVA DE CONFIGURACIÓN DE RED */}
      {activeTab === 'network' && <NetworkConfigAuditor />}

      {/* PESTAÑA 3: HISTORIAL Y BUSCADOR */}
      {activeTab === 'history' && <ReportHistory />}
    </div>
  );
}

export default App;