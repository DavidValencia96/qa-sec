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
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* BANNER DE DIAGNÓSTICO GEMINI AI */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid #818cf8',
          borderRadius: '10px',
          padding: '20px 24px',
          boxShadow: '0 0 20px rgba(129, 140, 248, 0.15)',
        }}
      >
        <h3 style={{ color: '#a5b4fc', marginTop: 0, marginBottom: '10px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 Diagnóstico IA de Exposición ({targetHost})
        </h3>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.6', color: '#e0e7ff' }}>
          {analysis.riskAssessment}
        </p>
      </div>

      {/* MITIGACIONES TÉCNICAS */}
      <div>
        <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: 0, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛠️ Mitigaciones Técnicas & Reglas de Firewall
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analysis.mitigations.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                borderLeft: '4px solid #22c55e',
                padding: '14px 18px',
                borderRadius: '0 8px 8px 0',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <strong style={{ color: '#4ade80', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                Puerto {m.port > 0 ? m.port : 'General/Seguridad'}:
              </strong>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                {m.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};