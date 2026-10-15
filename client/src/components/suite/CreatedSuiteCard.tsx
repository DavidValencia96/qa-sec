import React from 'react';
import type { SuiteConfig } from './suite.types';

interface CreatedSuiteCardProps {
  config: SuiteConfig;
}

export const CreatedSuiteCard: React.FC<CreatedSuiteCardProps> = ({ config }) => {
  return (
    <div style={{ marginTop: '16px', padding: '12px', background: '#111827', border: '1px solid #10b981', borderRadius: '6px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#34d399' }}>✅ Suite Generada: {config.suiteName}</h4>
      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9ca3af' }}>Módulos de seguridad activados:</p>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#e5e7eb', fontSize: '14px' }}>
        {config.selectedModules.map((moduleName, idx) => (
          <li key={idx} style={{ marginBottom: '4px' }}>
            📌 <strong>{moduleName}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};