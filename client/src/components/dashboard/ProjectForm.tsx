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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        padding: '22px 24px',
        borderRadius: '14px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        marginBottom: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* ENCABEZADO DEL MÓDULO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              color: '#f8fafc',
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: '#38bdf8' }}>🚀</span> Escáner Web & Diseñador de Suites IA
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
            Análisis automatizado de parámetros, cabeceras HTTP y generación de pruebas dinámicas.
          </p>
        </div>

        <span
          style={{
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            padding: '4px 10px',
            borderRadius: '6px',
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
            color: '#38bdf8',
            fontSize: '0.82rem',
            fontWeight: 'bold',
            marginBottom: '6px',
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
            padding: '10px 14px',
            backgroundColor: 'rgba(2, 6, 23, 0.9)',
            color: '#34d399',
            border: '1px solid rgba(30, 41, 59, 0.9)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            boxSizing: 'border-box',
            outline: 'none',
            opacity: isRunning ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
        />
      </div>

      {/* BOTONES DE ACCIÓN CENTRADOS Y CONTROLADOS */}
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
            width: '100%',
            maxWidth: '480px',
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: isRunning
              ? 'rgba(30, 41, 59, 0.5)'
              : initHovered
              ? '#0284c7'
              : 'rgba(2, 132, 199, 0.85)',
            border: isRunning ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(56, 189, 248, 0.6)',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            boxShadow: isRunning
              ? 'none'
              : initHovered
              ? '0 0 14px rgba(2, 132, 199, 0.45)'
              : '0 0 8px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.2s ease',
            opacity: isRunning ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          ⚡ Inicializar Proyecto
        </button>

        {isRunning && (
          <button
            type="button"
            onClick={onResetAnalysis}
            onMouseEnter={() => setResetHovered(true)}
            onMouseLeave={() => setResetHovered(false)}
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '10px 18px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: '#f87171',
              backgroundColor: resetHovered
                ? 'rgba(239, 68, 68, 0.25)'
                : 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: resetHovered
                ? '0 0 12px rgba(239, 68, 68, 0.35)'
                : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            🔄 Cancelar / Nuevo Análisis
          </button>
        )}
      </div>
    </div>
  );
};