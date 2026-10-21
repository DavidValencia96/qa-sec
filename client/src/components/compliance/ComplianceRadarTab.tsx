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

  // Modal
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

  // Carga inicial RÁPIDA: solo consulta la lista de targets de MySQL
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

  // Cargar Ejemplo Funcional
  const handleLoadExample = () => {
    const exampleTarget = 'bebolder.com';
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

      {/* CABECERA ENTERPRISE ALINEADA CON BADGE Y BOTÓN EJEMPLO */}
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
          {/* BOTÓN IMPLEMENTAR EJEMPLO */}
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

          {/* BADGE CATEGORÍA */}
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
            placeholder="O escribe una IP / Dominio / URL manual (ej. bebolder.com)"
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

      {/* ESTADO INICIAL SINO SE HA EJECUTADO NINGUNA CONSULTA AÚN */}
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

      {/* LOADER DE CONSULTA EN PROGRESO */}
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
          {/* DIAGNÓSTICO EJECUTIVO IA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🤖 Diagnóstico Estratégico de Postura (Gemini AI) — <span style={{ color: '#ffffff' }}>[{customTargetInput || selectedTarget || 'Global Consolidado'}]</span>
              </h3>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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