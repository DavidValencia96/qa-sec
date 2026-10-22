import React, { useState } from 'react';
import type { RedTeamHistoryItem } from '../ReportHistory';

interface RedTeamHistoryTableProps {
  items: RedTeamHistoryItem[];
  onExportSingleRecord: (item: RedTeamHistoryItem) => void;
}

interface RedTeamFindingDetail {
  title?: string;
  vulnerabilityType?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  remediation?: string;
  evidenceToken?: string;
  evidencePayload?: string;
  exploitedOrigin?: string;
}

interface AiSummaryDetail {
  summary?: string;
  recommendations?: string[];
}

// Helper seguro para deserializar JSON
function safeJsonParse<T>(data: unknown, fallback: T): T {
  if (!data) return fallback;
  if (typeof data === 'object') return data as T;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error('Error parseando JSON en RedTeamHistoryTable:', e);
      return fallback;
    }
  }
  return fallback;
}

export const RedTeamHistoryTable: React.FC<RedTeamHistoryTableProps> = ({ items, onExportSingleRecord }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!items || items.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: '#94a3b8',
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(30, 41, 59, 0.8)',
          fontSize: '13px',
        }}
      >
        📜 No se registran ejecuciones de Red Team en el historial.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '20%' }}>ID Ejecución</th>
            <th style={{ padding: '14px 16px', width: '28%' }}>URL Objetivo</th>
            <th style={{ padding: '14px 16px', width: '15%' }}>Hallazgos JWT</th>
            <th style={{ padding: '14px 16px', width: '15%' }}>Hallazgos CORS</th>
            <th style={{ padding: '14px 16px', width: '10%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '12%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.id;

            const jwtFindings = safeJsonParse<RedTeamFindingDetail[]>(item.jwtFindingsJson, []);
            const corsFindings = safeJsonParse<RedTeamFindingDetail[]>(item.corsFindingsJson, []);
            const aiSummary = safeJsonParse<AiSummaryDetail | null>(item.aiSummaryJson, null);

            const hasJwt = jwtFindings.length > 0;
            const hasCors = corsFindings.length > 0;
            const phishingSimulationsCount = item.phishingCount || 0;

            return (
              <React.Fragment key={item.id}>
                <tr
                  style={{
                    borderBottom: isExpanded ? 'none' : '1px solid rgba(30, 41, 59, 0.6)',
                    backgroundColor: isExpanded ? 'rgba(30, 41, 59, 0.4)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* ID Ejecución */}
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                    <code
                      style={{
                        backgroundColor: '#020617',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {item.id}
                    </code>
                  </td>

                  {/* URL Objetivo */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc' }}>
                    <a
                      href={item.targetUrl.startsWith('http') ? item.targetUrl : `https://${item.targetUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#34d399', textDecoration: 'none' }}
                    >
                      {item.targetUrl}
                    </a>
                  </td>

                  {/* Hallazgos JWT */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    <span
                      style={{
                        backgroundColor: hasJwt ? 'rgba(127, 29, 29, 0.4)' : 'rgba(6, 78, 59, 0.4)',
                        border: `1px solid ${hasJwt ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                        color: hasJwt ? '#f87171' : '#34d399',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'inline-block',
                      }}
                    >
                      {jwtFindings.length} hallazgos
                    </span>
                  </td>

                  {/* Hallazgos CORS */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    <span
                      style={{
                        backgroundColor: hasCors ? 'rgba(127, 29, 29, 0.4)' : 'rgba(6, 78, 59, 0.4)',
                        border: `1px solid ${hasCors ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                        color: hasCors ? '#f87171' : '#34d399',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'inline-block',
                      }}
                    >
                      {corsFindings.length} hallazgos
                    </span>
                  </td>

                  {/* Fecha */}
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleString('es-ES')}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onExportSingleRecord(item)}
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(52, 211, 153, 0.4)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        📥 Exportar HTML
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleRow(item.id)}
                        style={{
                          backgroundColor: isExpanded ? '#0284c7' : 'rgba(2, 132, 199, 0.2)',
                          color: '#ffffff',
                          border: '1px solid rgba(56, 189, 248, 0.5)',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: isExpanded ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isExpanded ? '✕ Ocultar' : '👁️ Ver Detalle'}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* FILA ACORDEÓN DESPLEGABLE CON INFORMACIÓN COMPLETA COMPATIBLE CON EL REPORTE */}
                {isExpanded && (
                  <tr style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.8)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
                    <td colSpan={6} style={{ padding: '20px' }}>
                      <div
                        style={{
                          backgroundColor: '#090d16',
                          border: '1px solid #0284c7',
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: '0 0 25px rgba(2, 132, 199, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                        }}
                      >
                        {/* ENCABEZADO */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30, 41, 59, 0.8)', paddingBottom: '12px' }}>
                          <div>
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: '#38bdf8',
                                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              RED TEAM & ADVERSARY EMULATION
                            </span>
                            <h3 style={{ margin: '6px 0 0 0', fontSize: '15px', color: '#f8fafc', fontWeight: 'bold' }}>
                              ⚔️ Trazabilidad Red Team: <span style={{ color: '#38bdf8' }}>{item.targetUrl}</span>
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#ef4444',
                              padding: '4px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            ✕ Cerrar Detalle
                          </button>
                        </div>

                        {/* CONFIGURACIÓN Y SIMULACIÓN PHISHING */}
                        <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Simulaciones de Phishing / Social Eng:</span>
                            <strong style={{ color: phishingSimulationsCount > 0 ? '#38bdf8' : '#cbd5e1', fontSize: '13px' }}>
                              📧 {phishingSimulationsCount} envíos simulados
                            </strong>
                          </div>

                          {item.jwtToken && (
                            <div style={{ maxWidth: '60%' }}>
                              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Token JWT Evaluado:</span>
                              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#f87171', backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)', wordBreak: 'break-all' }}>
                                {item.jwtToken}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* RESUMEN IA */}
                        {aiSummary && (
                          <div
                            style={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '12px',
                              padding: '14px',
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', display: 'block', marginBottom: '4px' }}>
                              🧠 Diagnóstico Ejecutivo Red Team (Gemini AI):
                            </span>
                            <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                              {aiSummary.summary || 'Simulación de ataque completada sin vectores críticos detectados.'}
                            </p>
                          </div>
                        )}

                        {/* HALLAZGOS JWT */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc' }}>
                            🔑 Vulnerabilidades de Autenticación JWT ({jwtFindings.length}):
                          </span>
                          {jwtFindings.length === 0 ? (
                            <div style={{ backgroundColor: 'rgba(6, 78, 59, 0.2)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                              ✅ No se identificaron configuraciones débiles ni firmas manipulables en tokens JWT.
                            </div>
                          ) : (
                            jwtFindings.map((f, idx) => (
                              <div
                                key={idx}
                                style={{
                                  backgroundColor: '#020617',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '10px',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 'bold', color: '#f87171' }}>
                                    [{f.vulnerabilityType || 'JWT_ISSUE'}] {f.title || `Vulnerabilidad JWT #${idx + 1}`}
                                  </span>
                                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {f.severity || 'CRITICAL'}
                                  </span>
                                </div>
                                <p style={{ margin: '0 0 6px 0', color: '#cbd5e1' }}>{f.description}</p>
                                {(f.evidenceToken || f.evidencePayload) && (
                                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#38bdf8', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '4px', marginBottom: '6px', wordBreak: 'break-all' }}>
                                    Token de Evidencia Explotado: {f.evidenceToken || f.evidencePayload}
                                  </div>
                                )}
                                {f.remediation && (
                                  <div style={{ color: '#34d399', fontSize: '11px', backgroundColor: 'rgba(6, 78, 59, 0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                                    💡 <strong>Remediación:</strong> {f.remediation}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* HALLAZGOS CORS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc' }}>
                            🌐 Malas Configuraciones CORS Explotables ({corsFindings.length}):
                          </span>
                          {corsFindings.length === 0 ? (
                            <div style={{ backgroundColor: 'rgba(6, 78, 59, 0.2)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                              ✅ La política de origen cruzado (CORS) restringe adecuadamente el intercambio de recursos.
                            </div>
                          ) : (
                            corsFindings.map((f, idx) => (
                              <div
                                key={idx}
                                style={{
                                  backgroundColor: '#020617',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '10px',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 'bold', color: '#f87171' }}>
                                    [{f.vulnerabilityType || 'CORS_ISSUE'}] {f.exploitedOrigin ? `Origen Explotado: ${f.exploitedOrigin}` : f.title || `Vulnerabilidad CORS #${idx + 1}`}
                                  </span>
                                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {f.severity || 'HIGH'}
                                  </span>
                                </div>
                                <p style={{ margin: '0 0 6px 0', color: '#cbd5e1' }}>{f.description}</p>
                                {f.remediation && (
                                  <div style={{ color: '#34d399', fontSize: '11px', backgroundColor: 'rgba(6, 78, 59, 0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                                    💡 <strong>Remediación:</strong> {f.remediation}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* ACCIONES DEFENSIVAS SUGERIDAS */}
                        {aiSummary?.recommendations && aiSummary.recommendations.length > 0 && (
                          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15', display: 'block', marginBottom: '6px' }}>
                              💡 Acciones Defensivas Sugeridas:
                            </span>
                            <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
                              {aiSummary.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RedTeamHistoryTable;