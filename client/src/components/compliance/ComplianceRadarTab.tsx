import React, { useState, useEffect, useCallback } from 'react';
import {
  getComplianceRadarApi,
  getComplianceTargetsApi,
  type ComplianceRadarResponse,
  type ComplianceControlStatus,
} from '../../services/api.client';

export interface ComplianceModuleData {
  selectedTarget: string;
  customTargetInput: string;
  radarDataResponse: ComplianceRadarResponse | null;
}

interface ComplianceRadarTabProps {
  complianceData?: ComplianceModuleData;
  onUpdateComplianceData?: (data: Partial<ComplianceModuleData>) => void;
}

export const ComplianceRadarTab: React.FC<ComplianceRadarTabProps> = ({
  complianceData,
  onUpdateComplianceData,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(
    complianceData?.selectedTarget || ''
  );
  const [customTargetInput, setCustomTargetInput] = useState<string>(
    complianceData?.customTargetInput || ''
  );
  const [availableTargets, setAvailableTargets] = useState<string[]>([]);
  const [loadingTargets, setLoadingTargets] = useState<boolean>(true);
  const [radarData, setRadarData] = useState<ComplianceRadarResponse | null>(
    complianceData?.radarDataResponse || null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal interactivo
  const [selectedControl, setSelectedControl] = useState<ComplianceControlStatus | null>(null);

  // Popover tooltip hover
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Derivación segura de estado al cambiar de pestaña
  const [prevComplianceData, setPrevComplianceData] = useState(complianceData);
  if (complianceData !== prevComplianceData) {
    setPrevComplianceData(complianceData);
    if (complianceData?.selectedTarget !== undefined) setSelectedTarget(complianceData.selectedTarget);
    if (complianceData?.customTargetInput !== undefined) setCustomTargetInput(complianceData.customTargetInput);
    if (complianceData?.radarDataResponse !== undefined) setRadarData(complianceData.radarDataResponse);
  }

  const handleUpdateGlobalState = (patch: Partial<ComplianceModuleData>) => {
    if (onUpdateComplianceData) {
      onUpdateComplianceData(patch);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadTargetsOnly = async () => {
      try {
        const targets = await getComplianceTargetsApi();
        if (isMounted) {
          setAvailableTargets(targets || []);
        }
      } catch (err) {
        console.error('Error cargando objetivos de compliance:', err);
      } finally {
        if (isMounted) setLoadingTargets(false);
      }
    };

    loadTargetsOnly();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExecuteAnalysis = useCallback(
    async (targetToQuery: string) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const res = await getComplianceRadarApi(targetToQuery);
        setRadarData(res);
        handleUpdateGlobalState({ radarDataResponse: res });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleLoadExample = () => {
    const exampleTarget = 'urlexample.com';
    setCustomTargetInput(exampleTarget);
    setSelectedTarget('');

    handleUpdateGlobalState({
      customTargetInput: exampleTarget,
      selectedTarget: '',
    });

    handleExecuteAnalysis(exampleTarget);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const targetToUse = customTargetInput.trim() || selectedTarget;
    handleExecuteAnalysis(targetToUse || '');
  };

  const handleResetToGlobal = () => {
    setSelectedTarget('');
    setCustomTargetInput('');
    handleUpdateGlobalState({ selectedTarget: '', customTargetInput: '' });
    handleExecuteAnalysis('');
  };

  const currentTargetName = customTargetInput || selectedTarget || 'Global Consolidado';

  // Obtener lista consolidada de controles con fallas y sus hallazgos detallados
  const failingControlsList = radarData?.standards
    ? Object.values(radarData.standards).flatMap((std) =>
        std.controls
          .filter((ctrl) => ctrl.status !== 'PASSED' || ctrl.findingsDetails?.length > 0)
          .map((ctrl) => ({ ...ctrl, standardName: std.standardName }))
      )
    : [];

  /* ==========================================================================
     EXPORTADORES DE INFORMES (INCLUYE DETALLE TÉCNICO DE HALLAZGOS)
     ========================================================================== */

  const handleExportComplianceHTML = () => {
    if (!radarData || !radarData.standards) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe de Compliance Radar - ${currentTargetName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #090d16; color: #f8fafc; padding: 30px; line-height: 1.6; }
    .header { border-bottom: 2px solid #38bdf8; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #0284c7; color: #fff; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 14px; }
    .summary-card { background: #0f172a; border-left: 4px solid #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 20px; border-radius: 10px; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .std-card { background: #020617; border: 1px solid rgba(56,189,248,0.2); padding: 20px; border-radius: 10px; }
    .std-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 12px; }
    .ctrl-item { background: #0f172a; padding: 10px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; font-size: 13px; }
    .status-passed { color: #4ade80; font-weight: bold; }
    .status-failed { color: #f87171; font-weight: bold; }
    .findings-container { background: #020617; border: 1px solid #ef4444; border-radius: 10px; padding: 20px; margin-top: 30px; }
    .finding-box { background: rgba(15, 23, 42, 0.9); border-left: 4px solid #ef4444; border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 8px; margin-bottom: 12px; }
    .sev-badge { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    ul { margin: 5px 0; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📊 QA-SEC SUITE - Compliance Radar</h1>
      <p>Objetivo Auditado: <strong>${currentTargetName}</strong> | Fecha: ${new Date().toLocaleString('es-ES')}</p>
    </div>
    <div class="badge">Cumplimiento: ${radarData.overallComplianceScore}%</div>
  </div>

  <div class="summary-card">
    <h2>🤖 Diagnóstico Estratégico de Postura (Gemini AI)</h2>
    <p>${radarData.aiExecutiveSummary?.summary || 'Análisis normativo de la postura de seguridad.'}</p>
    ${
      radarData.aiExecutiveSummary?.priorityActionPlan?.length
        ? `<h3>💡 Plan de Acción Prioritario:</h3>
           <ul>${radarData.aiExecutiveSummary.priorityActionPlan.map((p) => `<li>${p}</li>`).join('')}</ul>`
        : ''
    }
  </div>

  <h2>📐 Estado por Matriz Normativa</h2>
  <div class="grid">
    ${Object.values(radarData.standards)
      .map(
        (std) => `
      <div class="std-card">
        <div class="std-header">
          <span>${std.standardName}</span>
          <span style="color: ${std.compliancePercentage >= 80 ? '#4ade80' : std.compliancePercentage >= 50 ? '#facc15' : '#f87171'};">${std.compliancePercentage}%</span>
        </div>
        <div>
          ${std.controls
            .map(
              (ctrl) => `
            <div class="ctrl-item">
              <span><strong>[${ctrl.controlId}]</strong> ${ctrl.title}</span>
              <span class="${ctrl.status === 'PASSED' ? 'status-passed' : 'status-failed'}">
                ${ctrl.status === 'PASSED' ? 'CUMPLE' : `${ctrl.failingFindingsCount} FALLA(S)`}
              </span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('')}
  </div>

  <!-- SECCIÓN DE HALLAZGOS Y EVIDENCIAS DETALLADAS -->
  <div class="findings-container">
    <h2 style="color: #ef4444; margin-top: 0;">🚨 Detalle de Brechas y Hallazgos Trazables (${failingControlsList.length} controles afectados)</h2>
    <p style="color: #94a3b8; font-size: 13px;">Evidencias técnicas obtenidas por los motores defensivos para cada control normativo con observaciones:</p>
    
    ${
      failingControlsList.length === 0
        ? '<p style="color: #4ade80; font-weight: bold;">✅ Todos los controles evaluados se encuentran en estado CUMPLE.</p>'
        : failingControlsList
            .map(
              (ctrl) => `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #38bdf8; margin-bottom: 6px; font-size: 15px;">
                [${ctrl.controlId}] ${ctrl.title} <small style="color: #94a3b8;">(${ctrl.standardName})</small>
              </h3>
              ${
                ctrl.findingsDetails && ctrl.findingsDetails.length > 0
                  ? ctrl.findingsDetails
                      .map(
                        (f) => `
                    <div class="finding-box">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <strong style="color: #ffffff; font-size: 14px;">[${f.sourceModule}] ${f.title}</strong>
                        <span class="sev-badge">${f.severity || 'HIGH'}</span>
                      </div>
                      ${
                        f.recommendation
                          ? `<div style="color: #cbd5e1; font-size: 12.5px; margin-top: 4px;">
                              💡 <strong>Acción Remedial Sugerida:</strong> ${f.recommendation}
                            </div>`
                          : ''
                      }
                    </div>
                  `
                      )
                      .join('')
                  : '<p style="color: #94a3b8; font-size: 13px;">Control con observaciones sin hallazgos unitarios asociados.</p>'
              }
            </div>
          `
            )
            .join('')
    }
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Compliance_Radar_${currentTargetName.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportComplianceMarkdown = () => {
    if (!radarData || !radarData.standards) return;

    let md = `# 📊 QA-SEC SUITE - Informe de Compliance Radar\n\n`;
    md += `- **Objetivo Auditado:** ${currentTargetName}\n`;
    md += `- **Fecha de Generación:** ${new Date().toLocaleString('es-ES')}\n`;
    md += `- **Puntuación Global de Cumplimiento:** ${radarData.overallComplianceScore}%\n\n`;

    md += `## 🤖 Diagnóstico Estratégico de Postura (Gemini AI)\n\n`;
    md += `${radarData.aiExecutiveSummary?.summary || 'Análisis de postura completado.'}\n\n`;

    if (radarData.aiExecutiveSummary?.priorityActionPlan?.length) {
      md += `### 💡 Plan de Acción Prioritario para Auditoría:\n`;
      radarData.aiExecutiveSummary.priorityActionPlan.forEach((item) => {
        md += `- ${item}\n`;
      });
      md += `\n`;
    }

    md += `## 📐 Desglose de Matriz Normativa\n\n`;
    Object.values(radarData.standards).forEach((std) => {
      md += `### ${std.standardName} — Cumplimiento: ${std.compliancePercentage}%\n\n`;
      md += `| Control ID | Título del Control | Estado | Hallazgos con Falla |\n`;
      md += `| --- | --- | --- | --- |\n`;
      std.controls.forEach((ctrl) => {
        const statusText = ctrl.status === 'PASSED' ? '✅ CUMPLE' : '🚨 FALLA';
        md += `| **${ctrl.controlId}** | ${ctrl.title} | ${statusText} | ${ctrl.failingFindingsCount} |\n`;
      });
      md += `\n`;
    });

    md += `## 🚨 Detalle de Brechas y Evidencias de Hallazgos\n\n`;
    if (failingControlsList.length === 0) {
      md += `✅ Todos los controles auditados cumplen con los estándares requeridos.\n\n`;
    } else {
      failingControlsList.forEach((ctrl) => {
        md += `### [${ctrl.controlId}] ${ctrl.title} (${ctrl.standardName})\n`;
        if (ctrl.findingsDetails && ctrl.findingsDetails.length > 0) {
          ctrl.findingsDetails.forEach((f) => {
            md += `- **[${f.sourceModule}] ${f.title}** (Severidad: \`${f.severity}\`)\n`;
            if (f.recommendation) {
              md += `  - 💡 *Acción remedial:* ${f.recommendation}\n`;
            }
          });
        }
        md += `\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Compliance_Radar_${currentTargetName.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderHelpIcon = (id: string, text: string) => (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }}>
      <span
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip(null)}
        style={{
          cursor: 'pointer',
          color: '#38bdf8',
          fontSize: '0.78rem',
          fontWeight: 'bold',
          background: 'rgba(56, 189, 248, 0.15)',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #38bdf8',
        }}
      >
        ?
      </span>

      {activeTooltip === id && (
        <div
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.98)',
            color: '#e2e8f0',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            width: '260px',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
            backdropFilter: 'blur(8px)',
            zIndex: 99,
            lineHeight: '1.4',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return '#22c55e';
    if (pct >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(10px)',
        padding: '28px',
        borderRadius: '12px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        marginBottom: '28px',
      }}
    >
      <style>{`
        @keyframes spinner-rotator {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* CABECERA ENTERPRISE */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          gap: '16px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📊 Compliance Radar & Matriz Normativa
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Mapeo automatizado de hallazgos contra OWASP Top 10 (2021), ISO/IEC 27001 y NIST SP 800-53.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          <button
            type="button"
            onClick={handleLoadExample}
            disabled={loading}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid #38bdf8',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ Cargar Ejemplo Funcional
          </button>

          <span
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #38bdf8',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
            }}
          >
            Compliance & Governance
          </span>
        </div>
      </div>

      {/* PANEL DE SELECCIÓN DE OBJETIVO */}
      <div
        style={{
          background: 'rgba(9, 9, 11, 0.6)',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          marginBottom: '24px',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' }}>
          🎯 Panel de Selección de Objetivo Normativo:
          {renderHelpIcon('targetSelect', 'Filtra el nivel de cumplimiento para un host en particular o consulta la postura global consolidada.')}
        </label>

        <form onSubmit={handleApplyFilter} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            disabled={loading || loadingTargets}
            value={selectedTarget}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedTarget(val);
              setCustomTargetInput(val);
              handleUpdateGlobalState({ selectedTarget: val, customTargetInput: val });
            }}
            style={{
              flex: '1',
              minWidth: '220px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#ffffff',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: loading || loadingTargets ? 'not-allowed' : 'pointer',
              opacity: loading || loadingTargets ? 0.6 : 1,
            }}
          >
            <option value="">
              {loadingTargets ? '⏳ Cargando opciones...' : '🌐 Todos los Objetivos (Vista Global)'}
            </option>
            {availableTargets.map((tgt, idx) => (
              <option key={idx} value={tgt}>
                🎯 {tgt}
              </option>
            ))}
          </select>

          <input
            type="text"
            disabled={loading}
            placeholder="O escribe una IP / Dominio / URL manual (ej. urlexample.com)"
            value={customTargetInput}
            onChange={(e) => {
              setCustomTargetInput(e.target.value);
              handleUpdateGlobalState({ customTargetInput: e.target.value });
            }}
            style={{
              flex: '2',
              minWidth: '240px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              outline: 'none',
              opacity: loading ? 0.6 : 1,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 18px',
              background: loading ? 'rgba(51, 65, 85, 0.6)' : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {loading ? '⏳ Analizando...' : '🔍 Filtrar Objetivo'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleResetToGlobal}
            style={{
              padding: '10px 16px',
              background: 'rgba(30, 41, 59, 0.6)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            🌐 Cargar Global
          </button>
        </form>
      </div>

      {!loading && !radarData && (
        <div style={{ background: 'rgba(9, 9, 11, 0.6)', padding: '40px', borderRadius: '8px', border: '1px border-dashed rgba(56, 189, 248, 0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px' }}>
            📋 Selecciona un objetivo y presiona "Filtrar Objetivo" o "Cargar Global"
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            El análisis normativo con Gemini AI se ejecutará únicamente cuando presiones el botón de consulta.
          </p>
        </div>
      )}

      {loading && (
        <div style={{ background: 'rgba(9, 9, 11, 0.6)', padding: '40px', borderRadius: '8px', border: '1px solid #38bdf8', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '1.2rem', color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px' }}>
            ⏳ Mapeando matriz normativamente con Gemini AI...
          </div>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
            Procesando hallazgos filtrados para <strong style={{ color: '#fff' }}>"{customTargetInput || selectedTarget || 'Global'}"</strong>...
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(127, 29, 29, 0.3)', border: '1px solid #ef4444', color: '#f87171', padding: '14px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          ⚠️ Error al cargar el radar de cumplimiento: {error}
        </div>
      )}

      {/* RESULTADOS */}
      {!loading && radarData && radarData.standards && (
        <>
          {/* DIAGNÓSTICO EJECUTIVO IA + BARRA DE EXPORTACIÓN */}
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🤖 Diagnóstico Estratégico de Postura (Gemini AI) — <span style={{ color: '#ffffff' }}>[{currentTargetName}]</span>
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleExportComplianceHTML}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 10px rgba(52, 211, 153, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📥 Exportar HTML
                </button>

                <button
                  type="button"
                  onClick={handleExportComplianceMarkdown}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    backgroundColor: 'rgba(2, 132, 199, 0.15)',
                    color: '#38bdf8',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  📝 Exportar Markdown
                </button>

                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    color: getPercentageColor(radarData.overallComplianceScore),
                    background: 'rgba(15, 23, 42, 0.8)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${getPercentageColor(radarData.overallComplianceScore)}`,
                  }}
                >
                  Cumplimiento: {radarData.overallComplianceScore}%
                </span>
              </div>
            </div>

            <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 12px 0' }}>
              {radarData.aiExecutiveSummary?.summary}
            </p>

            {radarData.aiExecutiveSummary?.priorityActionPlan && radarData.aiExecutiveSummary.priorityActionPlan.length > 0 && (
              <div>
                <h4 style={{ color: '#facc15', fontSize: '0.9rem', marginBottom: '8px' }}>💡 Plan de Acción Prioritario para Auditoría:</h4>
                <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                  {radarData.aiExecutiveSummary.priorityActionPlan.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* GRID DE ESTÁNDARES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {Object.values(radarData.standards).map((std) => (
              <div key={std.standard} style={{ background: 'rgba(9, 9, 11, 0.6)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem' }}>{std.standardName}</h3>
                  <strong
                    style={{
                      color: getPercentageColor(std.compliancePercentage),
                      fontSize: '1.1rem',
                    }}
                  >
                    {std.compliancePercentage}%
                  </strong>
                </div>

                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: `${std.compliancePercentage}%`,
                      height: '100%',
                      background: getPercentageColor(std.compliancePercentage),
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {std.controls.map((ctrl: ComplianceControlStatus) => (
                    <div
                      key={ctrl.controlId}
                      onClick={() => setSelectedControl(ctrl)}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'border-color 0.2s ease',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#38bdf8', fontSize: '0.85rem', display: 'block' }}>{ctrl.controlId}</strong>
                        <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{ctrl.title}</span>
                      </div>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: ctrl.status === 'PASSED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: ctrl.status === 'PASSED' ? '#4ade80' : '#f87171',
                          border: `1px solid ${ctrl.status === 'PASSED' ? '#22c55e' : '#ef4444'}`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ctrl.status === 'PASSED' ? 'CUMPLE' : `${ctrl.failingFindingsCount} FALLA(S)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* SECCIÓN EXPANDIDA DE EVIDENCIAS Y FALLAS DIRECTAS EN PANTALLA */}
          <div
            style={{
              background: 'rgba(9, 9, 11, 0.75)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ color: '#f87171', margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🚨 Detalle de Hallazgos y Brechas Normativas (Evidencias de Auditoría)
                </h3>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                  Lista consolidada de vulnerabilidades detectadas que impactan el cumplimiento del objetivo seleccionado.
                </span>
              </div>
              <span
                style={{
                  background: failingControlsList.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  border: `1px solid ${failingControlsList.length > 0 ? '#ef4444' : '#22c55e'}`,
                  color: failingControlsList.length > 0 ? '#f87171' : '#4ade80',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                {failingControlsList.length} Controles Observados
              </span>
            </div>

            {failingControlsList.length === 0 ? (
              <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ✅ Excelente postura: Todos los controles evaluados se encuentran en estricto cumplimiento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {failingControlsList.map((ctrl) => (
                  <div
                    key={`${ctrl.standardName}-${ctrl.controlId}`}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#38bdf8', fontSize: '0.92rem', fontWeight: 'bold' }}>
                        [{ctrl.controlId}] {ctrl.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                        {ctrl.standardName}
                      </span>
                    </div>

                    {ctrl.findingsDetails && ctrl.findingsDetails.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ctrl.findingsDetails.map((f, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(9, 9, 11, 0.85)',
                              borderLeft: '4px solid #ef4444',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '6px',
                              padding: '10px 14px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>[{f.sourceModule}] {f.title}</strong>
                              <span
                                style={{
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#f87171',
                                  border: '1px solid #ef4444',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 'bold',
                                }}
                              >
                                {f.severity || 'HIGH'}
                              </span>
                            </div>
                            {f.recommendation && (
                              <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '4px' }}>
                                💡 <strong>Acción remedial:</strong> {f.recommendation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <small style={{ color: '#94a3b8' }}>Control con observaciones sin hallazgos individuales registrados.</small>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL DE DETALLE DE CONTROL */}
      {selectedControl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.98)', padding: '24px', borderRadius: '10px', maxWidth: '650px', width: '90%', border: '1px solid #38bdf8', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)' }}>
            <h3 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1.2rem' }}>
              [{selectedControl.controlId}] {selectedControl.title}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '16px' }}>
              Estado del Control: <strong style={{ color: selectedControl.status === 'PASSED' ? '#4ade80' : '#ef4444' }}>{selectedControl.status}</strong>
            </p>

            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '10px' }}>
              Hallazgos Trazables Mapeados ({selectedControl.findingsDetails.length}):
            </h4>

            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedControl.findingsDetails.length === 0 ? (
                <p style={{ color: '#4ade80', margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ✅ Control en cumplimiento estricto. No se detectan vulnerabilidades asociadas en el backend.
                </p>
              ) : (
                selectedControl.findingsDetails.map((f, idx) => (
                  <div key={idx} style={{ background: 'rgba(9, 9, 11, 0.7)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #ef4444', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>[{f.sourceModule}] {f.title}</strong>
                      <span style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 'bold' }}>{f.severity}</span>
                    </div>
                    {f.recommendation && (
                      <small style={{ color: '#a1a1aa', display: 'block', marginTop: '4px', fontSize: '0.8rem' }}>
                        💡 Acción remedial: {f.recommendation}
                      </small>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedControl(null)}
              style={{
                marginTop: '20px',
                padding: '8px 16px',
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ✕ Cerrar Detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};