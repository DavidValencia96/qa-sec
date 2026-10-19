import React, { useState } from 'react';

export interface ConsolidatedReportOptions {
  projectName: string;
  targetUrl?: string;
  format: 'html' | 'markdown';
  includedModules: {
    webScan: boolean;
    networkScan: boolean;
    sastAudit: boolean;
    loadTest: boolean;
    dastAudit: boolean;
    scaAudit: boolean;
    easmAudit: boolean;
    redTeamAudit: boolean;
  };
}

interface ConsolidatedReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ConsolidatedReportOptions) => void;
  loading: boolean;
}

export const ConsolidatedReportExportModal: React.FC<ConsolidatedReportExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  loading,
}) => {
  const [projectName, setProjectName] = useState<string>('Proyecto Principal QA-Sec');
  const [targetUrl, setTargetUrl] = useState<string>('http://localhost:3000');
  const [format, setFormat] = useState<'html' | 'markdown'>('html');
  const [modules, setModules] = useState({
    webScan: true,
    networkScan: true,
    sastAudit: true,
    loadTest: true,
    dastAudit: true,
    scaAudit: true,
    easmAudit: true,
    redTeamAudit: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    onExport({
      projectName,
      targetUrl,
      format,
      includedModules: modules,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '520px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.2rem' }}>
            📄 Exportar Informe Consolidado Ejecutivo
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
              Nombre del Proyecto / Sistema
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#09090b',
                color: '#fff',
                border: '1px solid #3f3f46',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
              URL / Host Principal Objetivo
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#09090b',
                color: '#fff',
                border: '1px solid #3f3f46',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '10px' }}>
              Módulos a Incluir en el Informe:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.webScan}
                  onChange={(e) => setModules({ ...modules, webScan: e.target.checked })}
                />{' '}
                🌐 Auditoría Web & Inyección de Inputs (Playwright)
              </label>

              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.networkScan}
                  onChange={(e) => setModules({ ...modules, networkScan: e.target.checked })}
                />{' '}
                🛡️ Superficie & Configuración de Red
              </label>

              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.sastAudit}
                  onChange={(e) => setModules({ ...modules, sastAudit: e.target.checked })}
                />{' '}
                🔍 Auditoría Estática de Código (SAST)
              </label>

              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.loadTest}
                  onChange={(e) => setModules({ ...modules, loadTest: e.target.checked })}
                />{' '}
                💥 Pruebas de Carga & Resiliencia DoS
              </label>

              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.dastAudit}
                  onChange={(e) => setModules({ ...modules, dastAudit: e.target.checked })}
                />{' '}
                🛡️ DAST & OpenAPI Dynamic Fuzzing
              </label>

              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.scaAudit}
                  onChange={(e) => setModules({ ...modules, scaAudit: e.target.checked })}
                />{' '}
                🔐 SCA & Supply Chain Security (Dependencias y Secretos)
              </label>

              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.easmAudit}
                  onChange={(e) => setModules({ ...modules, easmAudit: e.target.checked })}
                />{' '}
                🕸️ External Attack Surface Management (EASM & OSINT)
              </label>

              <label style={{ color: '#f4f4f5', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modules.redTeamAudit}
                  onChange={(e) => setModules({ ...modules, redTeamAudit: e.target.checked })}
                />{' '}
                ⚔️ Red Team & Simulación de Infiltración
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>
              Formato de Exportación
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'html' | 'markdown')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#09090b',
                color: '#fff',
                border: '1px solid #3f3f46',
              }}
            >
              <option value="html">📄 HTML Corporativo (Listo para Imprimir a PDF)</option>
              <option value="markdown">📝 Markdown (.md)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                background: '#27272a',
                color: '#a1a1aa',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                background: loading ? '#3f3f46' : '#2563eb',
                color: '#fff',
                fontWeight: 'bold',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '⏳ Generando Informe...' : '🚀 Generar & Descargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};