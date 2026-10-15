import React from 'react';

export interface MitigationRule {
  port: number;
  recommendation: string;
}

interface NetworkAiDiagnosisProps {
  targetHost: string;
  analysis: {
    riskAssessment: string;
    mitigations: MitigationRule[];
  };
}

export const NetworkAiDiagnosis: React.FC<NetworkAiDiagnosisProps> = ({ targetHost, analysis }) => {
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ background: '#1e1b4b', border: '1px solid #4338ca', padding: '16px', borderRadius: '6px', marginBottom: '16px' }}>
        <h3 style={{ color: '#a5b4fc', marginTop: 0 }}>📊 Diagnóstico IA de Exposición ({targetHost})</h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: '#e0e7ff' }}>{analysis.riskAssessment}</p>
      </div>

      <h3>🛠️ Mitigaciones Técnicas & Reglas de Firewall</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {analysis.mitigations.map((m, idx) => (
          <div key={idx} style={{ background: '#27272a', padding: '12px 16px', borderRadius: '6px', borderLeft: '4px solid #34d399' }}>
            <strong style={{ color: '#34d399', fontSize: '14px' }}>Puerto {m.port > 0 ? m.port : 'General/Seguridad'}:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#d1d5db' }}>{m.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};