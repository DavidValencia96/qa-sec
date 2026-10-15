import React from 'react';
import type { FindingDetail } from './report.types';

interface FormFindingContentProps {
  item: FindingDetail;
  onSelectEvidence: (evidence: { title: string; evidenceText: string }) => void;
}

interface RawPayloadShape {
  payloadUsed?: string;
}

function truncateSelector(selector: string, maxLength: number = 45): string {
  if (!selector) return 'N/A';
  if (selector.length <= maxLength) return selector;
  return `${selector.substring(0, 20)}...${selector.substring(selector.length - 20)}`;
}

export const FormFindingContent: React.FC<FormFindingContentProps> = ({ item, onSelectEvidence }) => {
  const isHttpOk = item.description.includes('HTTP: 200') || item.description.includes('200');

  const rawPayloadObj = typeof item.rawPayload === 'string'
    ? (JSON.parse(item.rawPayload) as RawPayloadShape)
    : (item.rawPayload as RawPayloadShape | undefined);

  const payloadUsed = item.promptInput || rawPayloadObj?.payloadUsed || "test_qa' (Control)";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        
        <div style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>
            📍 Localizador Evaluado
          </span>
          <code style={{ color: '#38bdf8', fontSize: '12px', fontFamily: 'monospace' }} title={item.description}>
            {truncateSelector(item.title.replace('[Evaluación Transaccional de Formulario] Campo: ', ''))}
          </code>
        </div>

        <div style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>
            🧪 Payload Inyectado (DB)
          </span>
          <code style={{ color: '#f43f5e', background: '#1e1e24', padding: '1px 5px', borderRadius: '3px', fontSize: '12px' }}>
            {payloadUsed}
          </code>
        </div>

        <div style={{ background: '#0f172a', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>
            🌐 Estado Servidor
          </span>
          <span style={{ color: isHttpOk ? '#4ade80' : '#f87171', fontWeight: 'bold', fontSize: '12px' }}>
            {isHttpOk ? 'HTTP 200 OK' : 'HTTP Error'}
          </span>
        </div>

      </div>

      <div style={{ background: '#111827', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
        <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          📝 Análisis Técnico & Trazabilidad:
        </span>
        <p style={{ margin: 0, color: '#e5e7eb', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {item.description}
        </p>
      </div>

      {item.evidence && (
        <div style={{ background: '#030712', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '12px' }}>
            <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginRight: '8px' }}>
              📡 Evidencia de Red:
            </span>
            <code style={{ color: '#34d399', fontSize: '12px', fontFamily: 'monospace' }}>
              {item.evidence}
            </code>
          </div>
          <button
            onClick={() => onSelectEvidence({ title: item.title, evidenceText: item.evidence! })}
            style={{ background: '#1f2937', color: '#60a5fa', border: '1px solid #374151', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}
          >
            🔍 Expandir
          </button>
        </div>
      )}

    </div>
  );
};