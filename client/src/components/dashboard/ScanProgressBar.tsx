import React from 'react';

interface ScanProgressBarProps {
  progress: number;
  statusText: string;
}

export const ScanProgressBar: React.FC<ScanProgressBarProps> = ({ progress, statusText }) => {
  return (
    <div style={{ marginTop: '16px', background: '#1e1e1e', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#60a5fa' }}>
        <span>⚡ {statusText}</span>
        <strong>{progress}%</strong>
      </div>
      <div style={{ width: '100%', background: '#374151', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
            transition: 'width 0.4s ease-in-out',
          }}
        />
      </div>
      <small style={{ color: '#9ca3af', display: 'block', marginTop: '10px', fontSize: '12px' }}>
        ⏳ Por favor espera un momento. Algunas páginas pueden tardar más en responder dependiendo de su tráfico de red.
      </small>
    </div>
  );
};