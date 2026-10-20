import React, { useState, useEffect } from 'react';
import {
  getComplianceRadarApi,
  getComplianceTargetsApi,
  type ComplianceRadarResponse,
  type ComplianceControlStatus,
} from '../../services/api.client';

export const ComplianceRadarTab: React.FC = () => {
  const [data, setData] = useState<ComplianceRadarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [availableTargets, setAvailableTargets] = useState<string[]>([]);

  // Filtros
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [customInputTarget, setCustomInputTarget] = useState<string>('');
  const [activeFilterName, setActiveFilterName] = useState<string>('');

  // Modal
  const [selectedControl, setSelectedControl] = useState<ComplianceControlStatus | null>(null);

  // Carga inicial RÁPIDA: solo consulta la lista de targets de MySQL
  useEffect(() => {
    let isMounted = true;
    const loadTargetsOnly = async () => {
      try {
        const targets = await getComplianceTargetsApi();
        if (isMounted) {
          setAvailableTargets(targets);
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

  // Función explícita activada SOLAMENTE por el usuario
  const handleExecuteAnalysis = async (targetToQuery: string, filterLabel: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await getComplianceRadarApi(targetToQuery);
      setData(res);
      setActiveFilterName(filterLabel);
    } catch (err) {
      alert(`Error ejecutando análisis normativo: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const targetToUse = customInputTarget.trim() || selectedTarget;
    if (!targetToUse) {
      handleExecuteAnalysis('', 'Global Consolidado');
    } else {
      handleExecuteAnalysis(targetToUse, targetToUse);
    }
  };

  const handleResetToGlobal = () => {
    setSelectedTarget('');
    setCustomInputTarget('');
    handleExecuteAnalysis('', 'Global Consolidado');
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '24px', borderRadius: '8px', marginTop: '20px' }}>
      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Compliance Radar & Matriz Normativa
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
            Mapeo automatizado de hallazgos contra OWASP Top 10 (2021), ISO/IEC 27001 y NIST SP 800-53.
          </p>
        </div>

        {data && !loading && (
          <div style={{ background: '#09090b', padding: '12px 24px', borderRadius: '8px', border: '1px solid #38bdf8', textAlign: 'center' }}>
            <span style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block' }}>
              Cumplimiento: <strong style={{ color: '#38bdf8' }}>{activeFilterName}</strong>
            </span>
            <strong
              style={{
                fontSize: '2rem',
                color: data.overallComplianceScore >= 80 ? '#22c55e' : data.overallComplianceScore >= 50 ? '#facc15' : '#ef4444',
              }}
            >
              {data.overallComplianceScore}%
            </strong>
          </div>
        )}
      </div>

      {/* PANEL DE SELECCIÓN */}
      <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '24px' }}>
        <h4 style={{ color: '#38bdf8', margin: '0 0 14px 0', fontSize: '0.95rem' }}>
          🎯 Panel de Selección de Objetivo Normativo:
        </h4>

        <form onSubmit={handleApplyFilter} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Selector de Objetivos */}
          <select
            disabled={loading || loadingTargets}
            value={selectedTarget}
            onChange={(e) => {
              setSelectedTarget(e.target.value);
              setCustomInputTarget(e.target.value);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#18181b',
              border: '1px solid #3f3f46',
              color: '#fff',
              fontSize: '0.85rem',
              flex: '1',
              minWidth: '220px',
              outline: 'none',
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

          {/* Input de texto manual */}
          <input
            type="text"
            disabled={loading}
            placeholder="O escribe una IP / Dominio / URL manual (ej. bebolder.com)"
            value={customInputTarget}
            onChange={(e) => setCustomInputTarget(e.target.value)}
            style={{
              flex: '2',
              minWidth: '240px',
              padding: '10px 12px',
              borderRadius: '6px',
              background: '#18181b',
              border: '1px solid #3f3f46',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              opacity: loading ? 0.6 : 1,
            }}
          />

          {/* Botones de consulta explícita */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 18px',
              background: loading ? '#3f3f46' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 0 10px rgba(37, 99, 235, 0.4)',
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
              background: '#27272a',
              color: '#a1a1aa',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            🌐 Cargar Global
          </button>
        </form>
      </div>

      {/* ESTADO INICIAL SINO SE HA EJECUTADO NINGUNA CONSULTA AÚN */}
      {!loading && !data && (
        <div style={{ background: '#09090b', padding: '40px', borderRadius: '8px', border: '1px border-dashed #334155', textAlign: 'center' }}>
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
        <div style={{ background: '#09090b', padding: '40px', borderRadius: '8px', border: '1px solid #38bdf8', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '1.2rem', color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px' }}>
            ⏳ Mapeando matriz normativamente con Gemini AI...
          </div>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
            Procesando hallazgos filtrados para <strong style={{ color: '#fff' }}>"{customInputTarget || selectedTarget || 'Global'}"</strong>...
          </p>
        </div>
      )}

      {/* RESULTADOS */}
      {!loading && data && data.standards && (
        <>
          {/* DIAGNÓSTICO EJECUTIVO IA */}
          <div style={{ background: '#09090b', padding: '18px', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '24px' }}>
            <h3 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🤖 Diagnóstico Estratégico de Postura (Gemini AI) — [{activeFilterName}]
            </h3>
            <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 12px 0' }}>
              {data.aiExecutiveSummary?.summary}
            </p>

            <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '8px' }}>💡 Plan de Acción Prioritario para Auditoría:</h4>
            <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              {data.aiExecutiveSummary?.priorityActionPlan?.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* GRID DE ESTÁNDARES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {Object.values(data.standards).map((std) => (
              <div key={std.standard} style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem' }}>{std.standardName}</h3>
                  <strong
                    style={{
                      color: std.compliancePercentage >= 80 ? '#22c55e' : std.compliancePercentage >= 50 ? '#facc15' : '#ef4444',
                      fontSize: '1.1rem',
                    }}
                  >
                    {std.compliancePercentage}%
                  </strong>
                </div>

                <div style={{ height: '8px', background: '#27272a', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: `${std.compliancePercentage}%`,
                      height: '100%',
                      background: std.compliancePercentage >= 80 ? '#22c55e' : std.compliancePercentage >= 50 ? '#facc15' : '#ef4444',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {std.controls.map((ctrl) => (
                    <div
                      key={ctrl.controlId}
                      onClick={() => setSelectedControl(ctrl)}
                      style={{
                        padding: '10px 12px',
                        background: '#18181b',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #27272a',
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
                          background: ctrl.status === 'PASSED' ? '#166534' : '#991b1b',
                          color: '#fff',
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

      {/* MODAL DE DETALLE */}
      {selectedControl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#18181b', padding: '24px', borderRadius: '8px', maxWidth: '650px', width: '90%', border: '1px solid #38bdf8', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#38bdf8', marginTop: 0, fontSize: '1.2rem' }}>
              [{selectedControl.controlId}] {selectedControl.title}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '16px' }}>
              Estado del Control: <strong style={{ color: selectedControl.status === 'PASSED' ? '#22c55e' : '#ef4444' }}>{selectedControl.status}</strong>
            </p>

            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '10px' }}>
              Hallazgos Trazables Mapeados ({selectedControl.findingsDetails.length}):
            </h4>

            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedControl.findingsDetails.length === 0 ? (
                <p style={{ color: '#22c55e', margin: 0, fontSize: '0.9rem' }}>
                  ✅ Control en cumplimiento estricto. No se detectan vulnerabilidades asociadas en MySQL.
                </p>
              ) : (
                selectedControl.findingsDetails.map((f, idx) => (
                  <div key={idx} style={{ background: '#09090b', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
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
                background: '#27272a',
                color: '#fff',
                border: 'none',
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