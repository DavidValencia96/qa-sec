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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        padding: '22px 24px',
        borderRadius: '14px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        marginBottom: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
      }}
    >
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
          <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#38bdf8' }}>🎯</span> Módulo de Auditoría de Inputs y Sanitización de Formularios
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
            Define la URL objetivo y especifica los localizadores (ID, Name, XPath o CSS) de los campos de entrada que deseas evaluar.
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
          Input Security
        </span>
      </div>

      {/* Input de URL */}
      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '6px' }}>
          🌐 URL Objetivo del Formulario:
        </label>
        <input
          type="text"
          value={targetUrl}
          onChange={(e) => onTargetUrlChange(e.target.value)}
          placeholder="https://urlExample.com/login"
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
          }}
        />
      </div>

      {/* Contenedor de Localizadores Dinámicos */}
      <div
        style={{
          backgroundColor: 'rgba(2, 6, 23, 0.6)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              fontSize: '0.78rem',
              fontWeight: 'bold',
              color: '#34d399',
              backgroundColor: isRunning ? 'rgba(30, 41, 59, 0.5)' : addHovered ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            + Agregar Campo
          </button>
        </div>

        {targetInputs.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, fontStyle: 'italic', padding: '10px 0' }}>
            No has agregado localizadores. Presiona "+ Agregar Campo" para especificar IDs, Names, XPaths o CSS Selectors.
          </p>
        ) : (
          targetInputs.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <select
                value={item.type}
                onChange={(e) => handleUpdateInputRow(item.id, 'type', e.target.value as LocatorType)}
                disabled={isRunning}
                style={{
                  backgroundColor: 'rgba(2, 6, 23, 0.9)',
                  color: '#38bdf8',
                  border: '1px solid rgba(30, 41, 59, 0.9)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
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
                  backgroundColor: 'rgba(2, 6, 23, 0.9)',
                  color: '#f8fafc',
                  border: '1px solid rgba(30, 41, 59, 0.9)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />

              <button
                type="button"
                onClick={() => handleRemoveInputRow(item.id)}
                disabled={isRunning}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem',
                  transition: 'all 0.15s ease',
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botones de Inicialización */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
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
          }}
        >
          ⚡ 1. Inicializar Proyecto de Inputs
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
              boxShadow: resetHovered ? '0 0 12px rgba(239, 68, 68, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            🔄 Cancelar / Nuevo Análisis
          </button>
        )}
      </div>
    </div>
  );
};