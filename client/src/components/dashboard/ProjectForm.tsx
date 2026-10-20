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
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(10px)',
        padding: '24px',
        borderRadius: '10px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* ENCABEZADO DEL MÓDULO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              color: '#ffffff',
              margin: 0,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            🚀 Escáner Web & Diseñador de Suites IA
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Análisis automatizado de parámetros, cabeceras HTTP y generación de pruebas dinámicas.
          </p>
        </div>

        <span
          style={{
            background: 'rgba(37, 99, 235, 0.2)',
            color: '#38bdf8',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid #38bdf8',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          Web Security
        </span>
      </div>

      {/* CAMPO URL OBJETIVO */}
      <div style={{ marginBottom: '18px' }}>
        <label
          style={{
            display: 'block',
            color: '#cbd5e1',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          🌐 URL Objetivo del Análisis:
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
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            outline: 'none',
            opacity: isRunning ? 0.6 : 1,
            transition: 'border 0.2s ease',
          }}
        />
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onInitProject}
          disabled={isRunning}
          onMouseEnter={() => setInitHovered(true)}
          onMouseLeave={() => setInitHovered(false)}
          style={{
            flex: '1',
            minWidth: '200px',
            padding: '12px 20px',
            fontSize: '0.95rem',
            fontWeight: '700',
            color: '#ffffff',
            background: isRunning
              ? 'rgba(45, 55, 72, 0.6)'
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
          Inicializar Proyecto
        </button>

        {isRunning && (
          <button
            type="button"
            onClick={onResetAnalysis}
            onMouseEnter={() => setResetHovered(true)}
            onMouseLeave={() => setResetHovered(false)}
            style={{
              flex: '1',
              minWidth: '200px',
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