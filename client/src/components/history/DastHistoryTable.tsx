import React, { useState } from 'react';
import type { DastHistoryItem } from '../ReportHistory';
import type { DastFindingItem } from '../../services/api.client';

interface DastHistoryTableProps {
  items: DastHistoryItem[];
}

const renderTesterBadge = (email?: string) => {
  const isGuest = !email || email.toLowerCase() === 'visitante';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '5px',
        fontSize: '11px',
        fontFamily: isGuest ? 'sans-serif' : 'monospace',
        fontWeight: 600,
        backgroundColor: isGuest ? 'rgba(100, 116, 139, 0.15)' : 'rgba(2, 132, 199, 0.2)',
        color: isGuest ? '#94a3b8' : '#38bdf8',
        border: `1px solid ${isGuest ? 'rgba(148, 163, 184, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{isGuest ? '👤' : '✉️'}</span>
      <span>{isGuest ? 'visitante' : email}</span>
    </span>
  );
};

export const DastHistoryTable: React.FC<DastHistoryTableProps> = ({ items }) => {
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
        📜 No se registran auditorías DAST & OpenAPI en el historial.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '18%' }}>ID Ejecución</th>
            <th style={{ padding: '14px 16px', width: '22%' }}>URL Base Target</th>
            <th style={{ padding: '14px 16px', width: '14%' }}>Endpoints Probados</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Hallazgos</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Tester</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '10%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const findings: DastFindingItem[] = item.findingsJson ? JSON.parse(item.findingsJson) : [];
            const aiSummary = item.aiSummaryJson ? JSON.parse(item.aiSummaryJson) : null;
            const hasFindings = findings.length > 0;

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

                  {/* URL Target */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc' }}>
                    <a
                      href={item.targetBaseUrl.startsWith('http') ? item.targetBaseUrl : `http://${item.targetBaseUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#34d399', textDecoration: 'none' }}
                    >
                      {item.targetBaseUrl}
                    </a>
                  </td>

                  {/* Endpoints Probados */}
                  <td style={{ padding: '14px 16px', color: '#cbd5e1', fontWeight: '500' }}>
                    {item.totalEndpointsTested} endpoints
                  </td>

                  {/* Hallazgos */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    <span
                      style={{
                        backgroundColor: hasFindings ? 'rgba(127, 29, 29, 0.4)' : 'rgba(6, 78, 59, 0.4)',
                        border: `1px solid ${hasFindings ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                        color: hasFindings ? '#f87171' : '#34d399',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'inline-block',
                      }}
                    >
                      {findings.length} Hallazgos
                    </span>
                  </td>

                  {/* Fecha */}
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleString('es-ES')}
                  </td>

                  {/* Columna Tester */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {renderTesterBadge(item.testerEmail)}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isExpanded ? '✕ Ocultar' : '👁️ Ver Detalle'}
                    </button>
                  </td>
                </tr>

                {/* FILA ACORDEÓN DESPLEGABLE IN-LINE */}
                {isExpanded && (
                  <tr style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.8)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
                    <td colSpan={7} style={{ padding: '20px' }}>
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
                        {/* CABECERA Y BOTÓN CERRAR */}
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
                              DAST & OPENAPI DIAGNOSTIC
                            </span>
                            <h3 style={{ margin: '6px 0 0 0', fontSize: '15px', color: '#f8fafc', fontWeight: 'bold' }}>
                              🛡️ Trazabilidad de Dinámica DAST: <span style={{ color: '#38bdf8' }}>{item.targetBaseUrl}</span>
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
                              🧠 Diagnóstico Estratégico IA:
                            </span>
                            <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                              {aiSummary.summary || 'Análisis dinámico completado sin riesgos críticos detectados en la interfaz OpenAPI.'}
                            </p>
                          </div>
                        )}

                        {/* LISTA DE HALLAZGOS CON TIPADO ESTRICTO */}
                        {findings.length === 0 ? (
                          <div style={{ backgroundColor: 'rgba(6, 78, 59, 0.2)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', borderRadius: '10px', padding: '14px', fontSize: '12px', fontWeight: '500' }}>
                            ✅ No se encontraron vulnerabilidades ni vectores de inyección durante el fuzzing OpenAPI en los {item.totalEndpointsTested} endpoints probados.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc' }}>
                              🔍 Hallazgos Detectados ({findings.length}):
                            </span>
                            {findings.map((f: DastFindingItem, idx: number) => (
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <span style={{ fontWeight: 'bold', color: '#f87171' }}>
                                    [{f.vulnerabilityType}] {f.httpMethod} {f.endpointPath}
                                  </span>
                                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {f.severity}
                                  </span>
                                </div>
                                <p style={{ margin: '0 0 6px 0', color: '#cbd5e1' }}>{f.description}</p>
                                {f.evidencePayload && (
                                  <div style={{ fontFamily: 'monospace', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#38bdf8', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', wordBreak: 'break-all' }}>
                                    Evidencia Payload: {f.evidencePayload}
                                  </div>
                                )}
                              </div>
                            ))}
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

export default DastHistoryTable;