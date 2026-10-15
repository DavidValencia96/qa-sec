import React from 'react';
import type { FindingDetail } from './report.types';

interface FindingCardProps {
  item: FindingDetail;
  currentTargetUrl: string;
  onSelectFinding: (item: FindingDetail) => void;
  onSelectEvidence: (evidence: { title: string; evidenceText: string }) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  item,
  currentTargetUrl,
  onSelectFinding,
  onSelectEvidence,
}) => {
  const linkUrl = item.targetUrl || currentTargetUrl;
  const isLongEvidence = item.evidence && item.evidence.length > 500;
  const displayEvidence = isLongEvidence ? `${item.evidence?.substring(0, 500)}...` : item.evidence;

  const severityColors: Record<FindingDetail['severity'], string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6',
    INFO: '#6b7280',
  };

  return (
    <div style={{ marginBottom: '16px', padding: '16px', background: '#2d2d2d', borderRadius: '6px', borderLeft: `4px solid ${item.severity === 'CRITICAL' ? '#ef4444' : '#6b7280'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '18px' }}>{item.title}</h4>
          <button
            onClick={() => onSelectFinding(item)}
            title="Ver detalle completo del hallazgo"
            style={{ background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🔍 Detalle Completo
          </button>
        </div>
        <span style={{ background: severityColors[item.severity], color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
          {item.severity}
        </span>
      </div>

      <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '8px' }}>{item.description}</p>

      {item.evidence && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <strong style={{ color: '#f59e0b', fontSize: '13px' }}>🔎 Evidencia Encontrada en la Respuesta:</strong>
            <button
              onClick={() => onSelectEvidence({ title: item.title, evidenceText: item.evidence! })}
              style={{ background: '#374151', color: '#60a5fa', border: '1px solid #4b5563', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
            >
              🔍 Expandir Evidencia
            </button>
          </div>
          <pre style={{
            background: '#09090b',
            color: '#f43f5e',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #3f3f46',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            maxHeight: '120px',
            overflowY: 'auto',
          }}>
            {displayEvidence}
          </pre>
        </div>
      )}

      <div style={{ background: '#18181b', padding: '12px', borderRadius: '4px', marginBottom: '8px', border: '1px dashed #52525b' }}>
        <strong style={{ color: '#60a5fa', fontSize: '13px', display: 'block', marginBottom: '6px' }}>🛠️ Pasos para Validación Manual (Humano):</strong>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', fontSize: '13px', lineHeight: '1.6' }}>
          <li>Abrir el navegador Chrome / Firefox.</li>
          <li>Presionar <code style={{ background: '#27272a', padding: '2px 4px', borderRadius: '3px' }}>F12</code> para abrir Developer Tools.</li>
          <li>Navegar directamente a la ruta objetivo: <a href={linkUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 'bold' }}>{linkUrl}</a></li>
          <li>Verificar en las pestañas <strong>Network</strong> o <strong>Response Body</strong> la presencia del patrón reportado en la evidencia superior.</li>
        </ol>
      </div>

      <p style={{ margin: 0, fontSize: '13px', color: '#34d399' }}>
        <strong>Mitigación:</strong> {item.recommendation}
      </p>
    </div>
  );
};