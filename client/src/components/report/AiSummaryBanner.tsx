import React from 'react';

interface AiSummaryBannerProps {
  summary: {
    executiveSummary: string;
    remediationPriority: string[];
  };
}

export const AiSummaryBanner: React.FC<AiSummaryBannerProps> = ({ summary }) => {
  return (
    <div style={{ background: '#064e3b', border: '1px solid #10b981', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
      <h3 style={{ color: '#34d399', margin: '0 0 8px 0' }}>💡 Resumen Ejecutivo (Gemini AI)</h3>
      <p style={{ margin: '0 0 12px 0', color: '#ecfdf5', fontSize: '14px', lineHeight: '1.5' }}>
        {summary.executiveSummary}
      </p>

      {summary.remediationPriority && summary.remediationPriority.length > 0 && (
        <div>
          <strong style={{ color: '#34d399', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            🎯 Orden de Prioridad de Remediación Recomendado por IA:
          </strong>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#a7f3d0', fontSize: '13px' }}>
            {summary.remediationPriority.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};