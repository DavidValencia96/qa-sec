import React, { useState } from 'react';
import type { EmailSecHistoryItem } from '../ReportHistory';

interface EmailSecHistoryTableProps {
  items: EmailSecHistoryItem[];
  onExportSingleRecord: (item: EmailSecHistoryItem) => void;
}

interface SpfDetails {
  rawSpf?: string;
  valid?: boolean;
}

interface DmarcDetails {
  rawDmarc?: string;
  policy?: string;
  valid?: boolean;
}

interface RblDetails {
  ipConsulted?: string;
  isClean?: boolean;
  blacklistsCount?: number;
  listedProviders?: string[];
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
      console.error('Error parseando JSON en EmailSecHistoryTable:', e);
      return fallback;
    }
  }
  return fallback;
}

export const EmailSecHistoryTable: React.FC<EmailSecHistoryTableProps> = ({ items, onExportSingleRecord }) => {
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
        📜 No se registran auditorías de Email Security en el historial.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '22%' }}>ID Ejecución</th>
            <th style={{ padding: '14px 16px', width: '22%' }}>Dominio / IP</th>
            <th style={{ padding: '14px 16px', width: '16%' }}>Estado DMARC</th>
            <th style={{ padding: '14px 16px', width: '16%' }}>Estado SPF</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '12%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.id;

            const spf = safeJsonParse<SpfDetails>(item.spfJson, {});
            const dmarc = safeJsonParse<DmarcDetails>(item.dmarcJson, {});
            const rbl = safeJsonParse<RblDetails>(item.rblJson, {});
            const aiSummary = safeJsonParse<AiSummaryDetail | null>(item.aiSummaryJson, null);

            // Discriminación del tipo de análisis para evitar falsos positivos
            const isIpAnalysis = Boolean(item.targetIp || rbl.ipConsulted);
            const isHeaderAnalysis = Boolean(!item.targetDomain && !item.targetIp);
            const isDomainAnalysis = Boolean(item.targetDomain || spf.rawSpf || dmarc.rawDmarc) && !isIpAnalysis && !isHeaderAnalysis;

            const isDmarcValid = dmarc.valid ?? Boolean(dmarc.policy && dmarc.policy !== 'none' && dmarc.policy !== 'MISSING');
            const isSpfValid = spf.valid ?? Boolean(spf.rawSpf);

            const dmarcPolicyText = dmarc.policy ? dmarc.policy.toUpperCase() : 'MISSING';

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

                  {/* Dominio / IP */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc' }}>
                    ✉️ {item.targetDomain || item.targetIp || 'Forensia Encabezados (.eml)'}
                  </td>

                  {/* Estado DMARC */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    {isDomainAnalysis ? (
                      <span
                        style={{
                          backgroundColor: isDmarcValid ? 'rgba(6, 78, 59, 0.4)' : 'rgba(127, 29, 29, 0.4)',
                          border: `1px solid ${isDmarcValid ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                          color: isDmarcValid ? '#34d399' : '#f87171',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          display: 'inline-block',
                        }}
                      >
                        {dmarcPolicyText}
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: 'rgba(30, 41, 59, 0.4)',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          color: '#94a3b8',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          display: 'inline-block',
                        }}
                      >
                        N/A
                      </span>
                    )}
                  </td>

                  {/* Estado SPF */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    {isDomainAnalysis ? (
                      <span
                        style={{
                          backgroundColor: isSpfValid ? 'rgba(6, 78, 59, 0.4)' : 'rgba(127, 29, 29, 0.4)',
                          border: `1px solid ${isSpfValid ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}`,
                          color: isSpfValid ? '#34d399' : '#f87171',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          display: 'inline-block',
                        }}
                      >
                        {isSpfValid ? 'VÁLIDO' : 'INVÁLIDO / AUSENTE'}
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: 'rgba(30, 41, 59, 0.4)',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          color: '#94a3b8',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          display: 'inline-block',
                        }}
                      >
                        N/A
                      </span>
                    )}
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

                {/* FILA ACORDEÓN DESPLEGABLE CON DETALLE COMPLETO DE EMAIL SEC */}
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
                              EMAIL SECURITY & DEFENSE (OSINT)
                            </span>
                            <h3 style={{ margin: '6px 0 0 0', fontSize: '15px', color: '#f8fafc', fontWeight: 'bold' }}>
                              ✉️ Diagnóstico de Seguridad de Correo: <span style={{ color: '#38bdf8' }}>{item.targetDomain || item.targetIp || 'Forensia .eml'}</span>
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

                        {/* RESUMEN DE PARÁMETROS */}
                        <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Dominio Objetivo:</span>
                            <strong style={{ color: '#f8fafc', fontSize: '12px' }}>{item.targetDomain || 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>IP Consultada RBL:</span>
                            <strong style={{ color: '#38bdf8', fontSize: '12px', fontFamily: 'monospace' }}>{rbl.ipConsulted || item.targetIp || 'N/A'}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Estado SPF:</span>
                            <strong style={{ color: isDomainAnalysis ? (isSpfValid ? '#34d399' : '#f87171') : '#94a3b8', fontSize: '12px' }}>
                              {isDomainAnalysis ? (isSpfValid ? 'VÁLIDO' : 'INVÁLIDO / AUSENTE') : 'N/A'}
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Política DMARC:</span>
                            <strong style={{ color: isDomainAnalysis ? (isDmarcValid ? '#34d399' : '#f87171') : '#94a3b8', fontSize: '12px' }}>
                              {isDomainAnalysis ? dmarcPolicyText : 'N/A'}
                            </strong>
                          </div>
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
                              🧠 Diagnóstico Ejecutivo Email Sec (Gemini AI):
                            </span>
                            <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                              {aiSummary.summary || 'Análisis de autenticación de correo completado.'}
                            </p>
                          </div>
                        )}

                        {/* REGISTRO SPF DETECTADO */}
                        {isDomainAnalysis && (
                          <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                              📋 Registro SPF Detectado:
                            </span>
                            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: spf.rawSpf ? '#38bdf8' : '#f87171', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(51, 65, 85, 0.5)', wordBreak: 'break-all' }}>
                              {spf.rawSpf || 'Sin registro SPF configurado'}
                            </div>
                          </div>
                        )}

                        {/* REGISTRO DMARC DETECTADO */}
                        {isDomainAnalysis && (
                          <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                              🛡️ Registro DMARC Detectado:
                            </span>
                            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: dmarc.rawDmarc ? '#38bdf8' : '#f87171', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(51, 65, 85, 0.5)', wordBreak: 'break-all' }}>
                              {dmarc.rawDmarc || 'Sin registro DMARC configurado'}
                            </div>
                          </div>
                        )}

                        {/* REPUTACIÓN IP RBL */}
                        {isIpAnalysis && (
                          <div style={{ backgroundColor: '#020617', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                              🔴 Reputación IP RBL ({rbl.ipConsulted || item.targetIp || 'N/A'}):
                            </span>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: rbl.isClean !== false ? '#34d399' : '#f87171' }}>
                              {rbl.isClean !== false ? '✅ IP limpia en proveedores RBL' : `⚠️ Listada en ${rbl.blacklistsCount || 1} listas negras`}
                            </div>
                          </div>
                        )}

                        {/* RECOMENDACIONES DEFENSIVAS */}
                        {aiSummary?.recommendations && aiSummary.recommendations.length > 0 && (
                          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '12px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15', display: 'block', marginBottom: '6px' }}>
                              💡 Recomendaciones Defensivas Sugeridas:
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

export default EmailSecHistoryTable;