import React, { useState } from 'react';
import type { TargetInput, LocatorType } from './dashboard.types';

interface InputInjectionAuditorProps {
  targetUrl: string;
  onTargetUrlChange: (url: string) => void;
  targetInputs: TargetInput[];
  onTargetInputsChange: (inputs: TargetInput[]) => void;
  onInitProject: () => void;
  onResetAnalysis: () => void;
  isRunning: boolean;
}

export const InputInjectionAuditor: React.FC<InputInjectionAuditorProps> = ({
  targetUrl,
  onTargetUrlChange,
  targetInputs,
  onTargetInputsChange,
  onInitProject,
  onResetAnalysis,
  isRunning,
}) => {
  const [initHovered, setInitHovered] = useState(false);
  const [resetHovered, setResetHovered] = useState(false);
  const [addHovered, setAddHovered] = useState(false);

  const handleAddInputRow = () => {
    const newInput: TargetInput = {
      id: crypto.randomUUID(),
      type: 'id',
      value: '',
      name: '',
      selector: '',
    };
    onTargetInputsChange([...targetInputs, newInput]);
  };

  const handleRemoveInputRow = (id: string) => {
    onTargetInputsChange(targetInputs.filter((item) => item.id !== id));
  };

  const handleUpdateInputRow = (id: string, field: 'type' | 'value', val: string) => {
    onTargetInputsChange(
      targetInputs.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

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
          <h2 style={{ marginTop: 0, color: '#ffffff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎯 Módulo de Auditoría de Inputs y Sanitización de Formularios
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Define la URL objetivo y especifica los localizadores (ID, Name, XPath o CSS) de los campos de entrada que deseas evaluar.
          </p>
        </div>

        <span
          style={{
            background: 'rgba(236, 72, 153, 0.15)',
            color: '#f472b6',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid #f472b6',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          Input Security
        </span>
      </div>

      {/* Input de URL */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: '#cbd5e1' }}>
          🌐 URL Objetivo del Formulario:
        </label>
        <input
          type="text"
          value={targetUrl}
          onChange={(e) => onTargetUrlChange(e.target.value)}
          placeholder="https://ejemplo.com/login"
          disabled={isRunning}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            fontSize: '0.95rem',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>

      {/* Contenedor de Localizadores Dinámicos */}
      <div
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.6)',
          padding: '18px',
          borderRadius: '8px',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <label style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏷️ Campos / Inputs Objetivo para Análisis de Sanitización:
          </label>
          <button
            type="button"
            onClick={handleAddInputRow}
            disabled={isRunning}
            onMouseEnter={() => setAddHovered(true)}
            onMouseLeave={() => setAddHovered(false)}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#ffffff',
              background: isRunning ? '#27272a' : addHovered ? '#059669' : '#047857',
              border: '1px solid #34d399',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: addHovered ? '0 0 10px rgba(52, 211, 153, 0.4)' : 'none',
            }}
          >
            + Agregar Campo
          </button>
        </div>

        {targetInputs.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
            No has agregado localizadores. Presiona "+ Agregar Campo" para especificar IDs, Names, XPaths o CSS Selectors.
          </p>
        ) : (
          targetInputs.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <select
                value={item.type}
                onChange={(e) => handleUpdateInputRow(item.id, 'type', e.target.value as LocatorType)}
                disabled={isRunning}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="id">ID (#)</option>
                <option value="name">Name ([name=])</option>
                <option value="xpath">XPath</option>
                <option value="css">CSS Selector</option>
              </select>

              <input
                type="text"
                placeholder="Ej: username, //input[@id='search'], .form-control"
                value={item.value}
                onChange={(e) => handleUpdateInputRow(item.id, 'value', e.target.value)}
                disabled={isRunning}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />

              <button
                type="button"
                onClick={() => handleRemoveInputRow(item.id)}
                disabled={isRunning}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  padding: '9px 14px',
                  borderRadius: '6px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botones de Inicialización */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
          1. Inicializar Proyecto de Inputs
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