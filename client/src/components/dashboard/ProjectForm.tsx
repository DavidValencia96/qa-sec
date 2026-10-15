import React, { useState } from 'react';

interface ProjectFormProps {
  targetUrl: string;
  onTargetUrlChange: (url: string) => void;
  onInitProject: () => void;
  onResetAnalysis: () => void;
  isRunning: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  targetUrl,
  onTargetUrlChange,
  onInitProject,
  onResetAnalysis,
  isRunning,
}) => {
  const [initHovered, setInitHovered] = useState(false);
  const [resetHovered, setResetHovered] = useState(false);

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#e2e8f0',
          textAlign: 'center',
        }}
      >
        URL Objetivo del Análisis:
      </label>

      <input
        type="text"
        value={targetUrl}
        onChange={(e) => onTargetUrlChange(e.target.value)}
        placeholder="https://ejemplo.com"
        disabled={isRunning}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#171923',
          color: '#ffffff',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          fontSize: '1rem',
          marginBottom: '16px',
          boxSizing: 'border-box',
          outline: 'none',
          opacity: isRunning ? 0.6 : 1,
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onInitProject}
          disabled={isRunning}
          onMouseEnter={() => setInitHovered(true)}
          onMouseLeave={() => setInitHovered(false)}
          style={{
            flex: '1',
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: '700',
            color: '#ffffff',
            background: isRunning
              ? '#2d3748'
              : initHovered
              ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
              : 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
            border: isRunning ? '1px solid #4a5568' : '1px solid #60a5fa',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            boxShadow: isRunning
              ? 'none'
              : initHovered
              ? '0 0 16px rgba(37, 99, 235, 0.5)'
              : '0 0 8px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.25s ease-in-out',
            opacity: isRunning ? 0.5 : 1,
          }}
        >
          1. Inicializar Proyecto
        </button>

        {isRunning && (
          <button
            onClick={onResetAnalysis}
            onMouseEnter={() => setResetHovered(true)}
            onMouseLeave={() => setResetHovered(false)}
            style={{
              flex: '1',
              padding: '12px 20px',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#ffffff',
              background: resetHovered
                ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              border: '1px solid #f87171',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: resetHovered
                ? '0 0 16px rgba(239, 68, 68, 0.6)'
                : '0 0 8px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.25s ease-in-out',
            }}
          >
            🔄 Cancelar / Nuevo Análisis
          </button>
        )}
      </div>
    </div>
  );
};