import React, { useState } from 'react';
import type { EasmHistoryItem } from '../ReportHistory';

interface EasmHistoryTableProps {
  items: EasmHistoryItem[];
  onExportSingleRecord: (item: EasmHistoryItem) => void;
}

// Helper seguro para deserializar JSON sin romper la interfaz
function safeJsonParse<T>(data: unknown, fallback: T): T {
  if (!data) return fallback;
  if (typeof data === 'object') return data as T;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error('Error parseando JSON en EasmHistoryTable:', e);
      return fallback;
    }
  }
  return fallback;
}

export const EasmHistoryTable: React.FC<EasmHistoryTableProps> = ({ items, onExportSingleRecord }) => {
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
        📜 No se registran auditorías EASM & OSINT en el historial.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '22%' }}>ID Ejecución</th>
            <th style={{ padding: '14px 16px', width: '22%' }}>Dominio Objetivo</th>
            <th style={{ padding: '14px 16px', width: '16%' }}>Subdominios</th>
            <th style={{ padding: '14px 16px', width: '16%' }}>Certificado SSL</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '12%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.id;

            // Deserialización protegida
            const subdomains = safeJsonParse<Array<string | { subdomain?: string; ipAddress?: string }>>(item.subdomainsJson, []);
            const dnsRecords = safeJsonParse<unknown>(item.dnsRecordsJson, []);
            const sslDetails = safeJsonParse<{ valid?: boolean; issuer?: string; daysRemaining?: number }>(item.sslDetailsJson, {});
            const wafTech = safeJsonParse<{ wafDetected?: boolean; wafName?: string; technologies?: string[] }>(item.wafTechJson, {});
            const aiSummary = safeJsonParse<{ summary?: string } | null>(item.aiSummaryJson, null);

            const isSslValid = sslDetails.valid ?? true;

            // Normalización segura del arreglo de registros DNS
            const parsedDnsList: Array<{ type: string; value: string }> = [];
            if (Array.isArray(dnsRecords)) {
              dnsRecords.forEach((rec) => {
                if (typeof rec === 'object' && rec !== null) {
                  const r = rec as Record<string, unknown>;
                  parsedDnsList.push({
                    type: String(r.type || r.recordType || 'DNS'),
                    value: String(r.value || r.address || r.target || JSON.stringify(r)),
                  });
                } else {
                  parsedDnsList.push({ type: 'RECORD', value: String(rec) });
                }
              });
            } else if (typeof dnsRecords === 'object' && dnsRecords !== null) {
              Object.entries(dnsRecords as Record<string, unknown>).forEach(([key, val]) => {
                parsedDnsList.push({
                  type: key.toUpperCase(),
                  value: Array.isArray(val) ? val.join(', ') : String(val),
                });
              });
            }

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

                  {/* Dominio Objetivo */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc' }}>
                    🌐 {item.targetDomain}
                  </td>

                  {/* Subdominios */}
                  <td style={{ padding: '14px 16px', color: '#38bdf8', fontWeight: 'bold' }}>
                    {subdomains.length} subdominios
                  </td>

                  {/* Certificado SSL */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    <span
                      style={{
                        backgroundColor: isSslValid ? 'rgba(6, 78, 59, 0.4)' : 'rgba(127, 29, 29, 0.4)',
                        border: `1px solid ${isSslValid ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                        color: isSslValid ? '#34d399' : '#f87171',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'inline-block',
                      }}
                    >
                      {isSslValid ? 'VÁLIDO' : 'INVÁLIDO / EXPIRADO'}
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

                {/* FILA ACORDEÓN DESPLEGABLE CON DETALLE EASM & OSINT */}
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
                              EASM & OSINT RECONNAISSANCE
                            </span>
                            <h3 style={{ margin: '6px 0 0 0', fontSize: '15px', color: '#f8fafc', fontWeight: 'bold' }}>
                              🕸️ Superficie Externa de Ataque: <span style={{ color: '#38bdf8' }}>{item.targetDomain}</span>
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
                              🧠 Diagnóstico OSINT / EASM IA:
                            </span>
                            <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                              {aiSummary.summary || 'Superficie de ataque analizada sin anomalías críticas en resolución de nombres o certificados.'}
                            </p>
                          </div>
                        )}

                        {/* SUBDOMINIOS Y WAF */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                          {/* SUBDOMINIOS */}
                          <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc', display: 'block', marginBottom: '8px' }}>
                              🎯 Subdominios Encontrados ({subdomains.length}):
                            </span>
                            {subdomains.length === 0 ? (
                              <span style={{ color: '#94a3b8', fontSize: '11px' }}>No se descubrieron subdominios secundarios.</span>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                                {subdomains.map((sub, idx) => {
                                  const name = typeof sub === 'string' ? sub : sub?.subdomain || String(sub);
                                  return (
                                    <span
                                      key={idx}
                                      style={{
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                        color: '#38bdf8',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* DETECCIÓN WAF Y TECNOLOGÍAS */}
                          <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc', display: 'block', marginBottom: '8px' }}>
                              🛡️ WAF & Tecnologías Detectadas:
                            </span>
                            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                              <div>
                                <strong>WAF:</strong>{' '}
                                <span style={{ color: wafTech.wafDetected ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
                                  {wafTech.wafDetected ? `Activo (${wafTech.wafName || 'Genérico'})` : 'No detectado'}
                                </span>
                              </div>
                              {wafTech.technologies && wafTech.technologies.length > 0 && (
                                <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {wafTech.technologies.map((tech, idx) => (
                                    <span key={idx} style={{ fontSize: '12px', backgroundColor: '#1e293b', color: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* REGISTROS DNS RENDERIZADOS CON ÉXITO */}
                        <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc', display: 'block', marginBottom: '8px' }}>
                            📡 Registros DNS ({parsedDnsList.length}):
                          </span>
                          {parsedDnsList.length === 0 ? (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>No hay registros DNS para mostrar.</span>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
                              {parsedDnsList.map((dns, idx) => (
                                <div key={idx} style={{ backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>[{dns.type}]</span>{' '}
                                  <span style={{ color: '#cbd5e1', wordBreak: 'break-all' }}>{dns.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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

export default EasmHistoryTable;