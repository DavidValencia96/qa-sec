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
    <div className="card" style={{ marginBottom: '20px', padding: '24px', backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a' }}>
      <h2 style={{ marginTop: 0, color: '#38bdf8', fontSize: '1.25rem', textAlign: 'center', marginBottom: '16px' }}>
        🎯 Módulo de Auditoría de Inputs y Sanitización de Formularios
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', marginBottom: '24px' }}>
        Define la URL objetivo y especifica los localizadores (ID, Name, XPath o CSS) de los campos de entrada que deseas evaluar.
      </p>

      {/* Input de URL */}
      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#e2e8f0' }}>
        URL Objetivo del Formulario:
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
          backgroundColor: '#09090b',
          color: '#ffffff',
          border: '1px solid #27272a',
          borderRadius: '6px',
          fontSize: '1rem',
          marginBottom: '20px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      {/* Contenedor de Localizadores Dinámicos */}
      <div style={{ backgroundColor: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: '700' }}>
            🏷️ Campos / Inputs Objetivo para Análisis de Sanitización:
          </label>
          <button
            type="button"
            onClick={handleAddInputRow}
            disabled={isRunning}
            onMouseEnter={() => setAddHovered(true)}
            onMouseLeave={() => setAddHovered(false)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#ffffff',
              background: isRunning ? '#27272a' : addHovered ? '#059669' : '#047857',
              border: '1px solid #34d399',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            + Agregar Campo
          </button>
        </div>

        {targetInputs.length === 0 ? (
          <p style={{ color: '#71717a', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
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
                  backgroundColor: '#18181b',
                  color: '#f3f4f6',
                  border: '1px solid #3f3f46',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
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
                  backgroundColor: '#18181b',
                  color: '#ffffff',
                  border: '1px solid #3f3f46',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />

              <button
                type="button"
                onClick={() => handleRemoveInputRow(item.id)}
                disabled={isRunning}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botones de Inicialización */}
      <div style={{ display: 'flex', gap: '12px' }}>
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
            background: isRunning ? '#27272a' : initHovered ? '#1d4ed8' : '#2563eb',
            border: '1px solid #60a5fa',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          1. Inicializar Proyecto de Inputs
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
              background: resetHovered ? '#dc2626' : '#b91c1c',
              border: '1px solid #f87171',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🔄 Cancelar / Nuevo Análisis
          </button>
        )}
      </div>
    </div>
  );
};