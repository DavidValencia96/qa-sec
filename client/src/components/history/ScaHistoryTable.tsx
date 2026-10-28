// client/src/components/history/ScaHistoryTable.tsx

import React, { useState } from 'react';
import {
  exportSingleRecordApi,
  type ScaVulnerabilityItem,
  type GitSecretFindingItem,
} from '../../services/api.client';

export interface ScaHistoryItem {
  id: string;
  testerEmail?: string;
  manifestType: string;
  totalDepsAudited: number;
  vulnerabilitiesJson?: string;
  gitSecretsJson?: string;
  aiSummaryJson?: string;
  createdAt: string;
}

interface ScaHistoryTableProps {
  items: ScaHistoryItem[];
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

export const ScaHistoryTable: React.FC<ScaHistoryTableProps> = ({ items }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleExport = async (item: ScaHistoryItem) => {
    try {
      const vulnerabilities: ScaVulnerabilityItem[] = item.vulnerabilitiesJson
        ? JSON.parse(item.vulnerabilitiesJson)
        : [];
      const gitSecrets: GitSecretFindingItem[] = item.gitSecretsJson
        ? JSON.parse(item.gitSecretsJson)
        : [];
      const aiSummary = item.aiSummaryJson ? JSON.parse(item.aiSummaryJson) : {};

      await exportSingleRecordApi({
        moduleType: 'sca',
        recordData: {
          id: item.id,
          testerEmail: item.testerEmail,
          manifestType: item.manifestType,
          totalDependenciesAudited: item.totalDepsAudited,
          vulnerabilities,
          gitSecrets,
          aiSummary,
          createdAt: item.createdAt,
        },
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar reporte SCA: ${(err as Error).message}`);
    }
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
        📜 No se registran auditorías SCA en el historial.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid rgba(30, 41, 59, 0.9)', color: '#38bdf8', fontWeight: 'bold' }}>
            <th style={{ padding: '14px 16px', width: '16%' }}>ID Ejecución</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Manifest</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Líneas / Deps</th>
            <th style={{ padding: '14px 16px', width: '14%' }}>Vulnerabilidades</th>
            <th style={{ padding: '14px 16px', width: '14%' }}>Secretos Git</th>
            <th style={{ padding: '14px 16px', width: '12%' }}>Fecha</th>
            <th style={{ padding: '14px 16px', width: '10%' }}>Tester</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', width: '10%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const vulns: ScaVulnerabilityItem[] = item.vulnerabilitiesJson
              ? JSON.parse(item.vulnerabilitiesJson)
              : [];
            const secrets: GitSecretFindingItem[] = item.gitSecretsJson
              ? JSON.parse(item.gitSecretsJson)
              : [];
            const aiSummary = item.aiSummaryJson ? JSON.parse(item.aiSummaryJson) : null;

            const hasVulns = vulns.length > 0;
            const hasSecrets = secrets.length > 0;

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

                  {/* Manifest */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold', color: '#f8fafc' }}>
                    📦 {item.manifestType}
                  </td>

                  {/* Líneas / Deps */}
                  <td style={{ padding: '14px 16px', color: '#cbd5e1', fontWeight: '500' }}>
                    {item.totalDepsAudited} auditadas
                  </td>

                  {/* Vulnerabilidades */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    <span
                      style={{
                        backgroundColor: hasVulns ? 'rgba(127, 29, 29, 0.4)' : 'rgba(6, 78, 59, 0.4)',
                        border: `1px solid ${hasVulns ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                        color: hasVulns ? '#f87171' : '#34d399',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'inline-block',
                      }}
                    >
                      {vulns.length} Detectadas
                    </span>
                  </td>

                  {/* Secretos Git */}
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>
                    <span
                      style={{
                        backgroundColor: hasSecrets ? 'rgba(127, 29, 29, 0.4)' : 'rgba(6, 78, 59, 0.4)',
                        border: `1px solid ${hasSecrets ? 'rgba(248, 113, 113, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                        color: hasSecrets ? '#f87171' : '#34d399',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'inline-block',
                      }}
                    >
                      {secrets.length} Expuestos
                    </span>
                  </td>

                  {/* Fecha */}
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleString('es-ES')}
                  </td>

                  {/* Tester */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {renderTesterBadge(item.testerEmail)}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleExport(item)}
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

                {/* FILA ACORDEÓN DESPLEGABLE */}
                {isExpanded && (
                  <tr style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.8)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
                    <td colSpan={8} style={{ padding: '20px' }}>
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
                        {/* ENCABEZADO DE DETALLE */}
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
                              SUPPLY CHAIN & DEPENDENCY AUDIT
                            </span>
                            <h3 style={{ margin: '6px 0 0 0', fontSize: '15px', color: '#f8fafc', fontWeight: 'bold' }}>
                              📦 Trazabilidad SCA: <span style={{ color: '#38bdf8' }}>{item.manifestType}</span> ({item.totalDepsAudited} dependencias)
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
                              🧠 Diagnóstico de Cadena de Suministro IA:
                            </span>
                            <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                              {aiSummary.summary || 'Análisis de dependencias y composición de software completado con éxito.'}
                            </p>
                          </div>
                        )}

                        {/* VULNERABILIDADES DE DEPENDENCIAS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc' }}>
                            🚨 Vulnerabilidades en Librerías ({vulns.length}):
                          </span>
                          {vulns.length === 0 ? (
                            <div style={{ backgroundColor: 'rgba(6, 78, 59, 0.2)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                              ✅ No se detectaron vulnerabilidades conocidas (CVEs) en las dependencias declaradas.
                            </div>
                          ) : (
                            vulns.map((v: ScaVulnerabilityItem, idx: number) => (
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
                                    {v.packageName} ({v.currentVersion})
                                  </span>
                                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {v.severity}
                                  </span>
                                </div>
                                <p style={{ margin: '0 0 6px 0', color: '#cbd5e1' }}>{v.description}</p>
                                {v.cveId && (
                                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#38bdf8' }}>
                                    CVE: {v.cveId}
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* SECRETOS GIT */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc' }}>
                            🔑 Secretos Expuestos en Repositorio ({secrets.length}):
                          </span>
                          {secrets.length === 0 ? (
                            <div style={{ backgroundColor: 'rgba(6, 78, 59, 0.2)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                              ✅ No se detectaron credenciales, API keys ni tokens en duro expuestos en el código fuente.
                            </div>
                          ) : (
                            secrets.map((s: GitSecretFindingItem, idx: number) => (
                              <div
                                key={idx}
                                style={{
                                  backgroundColor: '#020617',
                                  border: '1px solid rgba(234, 179, 8, 0.3)',
                                  borderRadius: '10px',
                                  padding: '12px',
                                  fontSize: '12px',
                                }}
                              >
                                <span style={{ fontWeight: 'bold', color: '#facc15', display: 'block', marginBottom: '4px' }}>
                                  ⚠️ {s.secretType}
                                </span>
                                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8', wordBreak: 'break-all' }}>
                                  Archivo: {s.filePath} | Autor: {s.author}
                                </div>
                              </div>
                            ))
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

export default ScaHistoryTable;