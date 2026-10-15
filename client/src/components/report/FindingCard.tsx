import React from 'react';
import type { FindingDetail } from './report.types';
import { FormFindingContent } from './FormFindingContent';

interface FindingCardProps {
  item: FindingDetail;
  currentTargetUrl: string;
  onSelectFinding: (item: FindingDetail) => void;
  onSelectEvidence: (evidence: { title: string; evidenceText: string }) => void;
}

function isInputAuditFinding(item: FindingDetail): boolean {
  const typeStr = (item.type || item.moduleName || '').toUpperCase();
  return typeStr.includes('INPUT') || typeStr.includes('FORM') || item.title.includes('Campo');
}

// Helper para limpiar el título si contiene XPaths largos
function formatCardTitle(title: string): string {
  if (!title.includes('Campo:')) return title;
  const [prefix, xpath] = title.split('Campo:');
  if (!xpath || xpath.trim().length <= 35) return title;
  const cleanXpath = xpath.trim();
  const truncated = `${cleanXpath.substring(0, 15)}...${cleanXpath.substring(cleanXpath.length - 15)}`;
  return `${prefix} Campo: ${truncated}`;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  item,
  currentTargetUrl,
  onSelectFinding,
  onSelectEvidence,
}) => {
  const isInputAudit = isInputAuditFinding(item);
  const linkUrl = item.targetUrl || currentTargetUrl;

  const severityColors: Record<FindingDetail['severity'], string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6',
    INFO: '#10b981',
  };

  return (
    <div style={{ marginBottom: '16px', padding: '16px', background: '#1f2937', borderRadius: '6px', borderLeft: `4px solid ${severityColors[item.severity]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.title}>
            {formatCardTitle(item.title)}
          </h4>
          <button
            onClick={() => onSelectFinding(item)}
            style={{ background: '#2563eb', border: 'none', color: '#fff', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '11px', flexShrink: 0 }}
          >
            🔍 Detalle Completo
          </button>
        </div>
        <span style={{ background: severityColors[item.severity], color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}>
          {item.severity}
        </span>
      </div>

      {isInputAudit ? (
        <FormFindingContent item={item} onSelectEvidence={onSelectEvidence} />
      ) : (
        <>
          <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '8px' }}>{item.description}</p>
          {item.evidence && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ color: '#f59e0b', fontSize: '12px' }}>🔎 Evidencia Encontrada:</strong>
                <button
                  onClick={() => onSelectEvidence({ title: item.title, evidenceText: item.evidence! })}
                  style={{ background: '#374151', color: '#60a5fa', border: '1px solid #4b5563', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  🔍 Expandir Evidencia
                </button>
              </div>
              <pre style={{ background: '#09090b', color: '#f43f5e', padding: '10px', borderRadius: '4px', fontSize: '12px', overflowY: 'auto', maxHeight: '100px' }}>
                {item.evidence}
              </pre>
            </div>
          )}
          <div style={{ background: '#111827', padding: '10px', borderRadius: '4px', marginBottom: '8px', border: '1px dashed #374151' }}>
            <strong style={{ color: '#60a5fa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>🛠️ Pasos para Validación Manual:</strong>
            <ol style={{ margin: 0, paddingLeft: '18px', color: '#9ca3af', fontSize: '12px' }}>
              <li>Abrir Developer Tools (<code style={{ background: '#1f2937', padding: '1px 3px' }}>F12</code>).</li>
              <li>Navegar a: <a href={linkUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>{linkUrl}</a></li>
              <li>Verificar en la pestaña Network la presencia del patrón reportado.</li>
            </ol>
          </div>
        </>
      )}

      <div style={{ marginTop: '12px', background: '#064e3b20', padding: '10px', borderRadius: '4px', border: '1px solid #064e3b60' }}>
        <strong style={{ color: '#34d399', fontSize: '12px', display: 'block', marginBottom: '2px' }}>🛡️ Dictamen & Mitigación Defensiva (Gemini AI):</strong>
        <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb' }}>{item.recommendation}</p>
      </div>
    </div>
  );
};