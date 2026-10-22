import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

  // Bloquea el scroll del body principal cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModuleToggle = (key: keyof typeof modules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '660px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#090d16',
          border: '1px solid #0284c7',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(2, 132, 199, 0.45)',
          color: '#f8fafc',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* CABECERA FIJA */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            ✕
          </button>

          <div style={{ marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                letterSpacing: '1px',
                fontWeight: 'bold',
                color: '#38bdf8',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '3px 10px',
                borderRadius: '6px',
              }}
            >
              REPORT CONSOLIDATOR PANEL
            </span>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📄 Exportar Informe Consolidado Ejecutivo
          </h3>
        </div>

        {/* FORMULARIO CON SCROLL INTERNO INDEPENDIENTE */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            gap: '16px',
          }}
        >
          {/* NOMBRE DEL PROYECTO */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(30, 41, 59, 0.9)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '6px',
                letterSpacing: '0.5px',
              }}
            >
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
                backgroundColor: '#020617',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '8px',
                padding: '10px 12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* URL OBJETIVO */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(30, 41, 59, 0.9)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '6px',
                letterSpacing: '0.5px',
              }}
            >
              URL / Host Principal Objetivo
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#020617',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '8px',
                padding: '10px 12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* MÓDULOS A INCLUIR */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(30, 41, 59, 0.9)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '12px',
                letterSpacing: '0.5px',
              }}
            >
              Módulos a Incluir en el Informe:
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '8px',
              }}
            >
              {[
                { key: 'webScan', label: '🌐 Auditoría Web & Inputs (Playwright)' },
                { key: 'networkScan', label: '🛡️ Superficie & Configuración de Red' },
                { key: 'sastAudit', label: '🔍 Auditoría Estática de Código (SAST)' },
                { key: 'loadTest', label: '💥 Pruebas de Carga & Resiliencia DoS' },
                { key: 'dastAudit', label: '🛡️ DAST & OpenAPI Dynamic Fuzzing' },
                { key: 'scaAudit', label: '🔐 SCA & Supply Chain (Dependencias/Keys)' },
                { key: 'easmAudit', label: '⚙️ External Attack Surface (EASM & OSINT)' },
                { key: 'redTeamAudit', label: '⚔️ Red Team & Simulación de Infiltración' },
              ].map((item) => {
                const k = item.key as keyof typeof modules;
                return (
                  <label
                    key={k}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: modules[k] ? '#f8fafc' : '#64748b',
                      backgroundColor: modules[k] ? 'rgba(2, 132, 199, 0.12)' : '#020617',
                      border: modules[k] ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid #1e293b',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={modules[k]}
                      onChange={() => handleModuleToggle(k)}
                      disabled={loading}
                      style={{ accentColor: '#0284c7', cursor: loading ? 'not-allowed' : 'pointer' }}
                    />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* FORMATO DE EXPORTACIÓN */}
          <div
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(30, 41, 59, 0.9)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                marginBottom: '6px',
                letterSpacing: '0.5px',
              }}
            >
              Formato de Exportación
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'html' | 'markdown')}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#020617',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '8px',
                padding: '10px 12px',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <option value="html">📄 HTML Corporativo (Listo para Imprimir a PDF)</option>
              <option value="markdown">📝 Markdown Técnico (.md)</option>
            </select>
          </div>

          {/* PIE Y BOTONES */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(30, 41, 59, 0.8)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#334155' : '#0284c7',
                color: '#ffffff',
                border: '1px solid #38bdf8',
                padding: '10px 22px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {loading ? '⏳ Generando Informe...' : '🚀 Generar & Descargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza fuera del árbol de componentes actual mediante createPortal
  return createPortal(modalContent, document.body);
};