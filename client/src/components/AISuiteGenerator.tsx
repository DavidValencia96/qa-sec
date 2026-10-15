import React, { useState, useEffect } from 'react';
import { getPromptPresetsApi, generateSuiteAIApi } from '../services/api.client.js';

interface PromptPreset {
  id: number;
  title: string;
  promptText: string;
}

export interface GeneratedSuiteResponse {
  suiteId: string;
  config: {
    suiteName: string;
    modules: string[];
    [key: string]: unknown;
  };
}

interface AISuiteGeneratorProps {
  projectId: string;
  onSuiteGenerated?: (suiteData: GeneratedSuiteResponse) => void;
  onSuiteCreated?: (suiteId: string) => void;
  isScanRunning?: boolean;
}

export const AISuiteGenerator: React.FC<AISuiteGeneratorProps> = ({
  projectId,
  onSuiteGenerated,
  onSuiteCreated,
  isScanRunning = false,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [presets, setPresets] = useState<PromptPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await getPromptPresetsApi();
        if (data.success) {
          setPresets(data.presets);
        }
      } catch (error) {
        console.error('Error al cargar plantillas de prompts:', error);
      }
    };
    loadPresets();
  }, []);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);

    if (!presetId) {
      setPrompt('');
      return;
    }

    const foundPreset = presets.find((p) => String(p.id) === presetId);
    if (foundPreset) {
      setPrompt(foundPreset.promptText);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setSelectedPresetId('');
  };

  const handleGenerateSuite = async () => {
    if (!prompt.trim() || !projectId || loading || isScanRunning) return;

    setLoading(true);
    try {
      const result = await generateSuiteAIApi(projectId, prompt);
      if (result.success) {
        if (typeof onSuiteGenerated === 'function') {
          onSuiteGenerated(result);
        }
        if (typeof onSuiteCreated === 'function') {
          onSuiteCreated(result.suiteId);
        }
      } else {
        alert(`Error al generar la suite: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al conectar con la IA:', error);
      alert('Error de conexión con el servidor al generar la suite.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || isScanRunning || !prompt.trim() || !projectId;

  return (
    <div className="card prompt-designer-card" style={{ marginTop: '16px' }}>
      <h3>🤖 Diseñador de Pruebas con Gemini AI</h3>

      {/* Selector de Plantillas Predefinidas */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: '#a0aec0' }}>
          Plantillas de Prompts Recomendados:
        </label>
        <select
          value={selectedPresetId}
          onChange={handlePresetChange}
          disabled={loading || isScanRunning}
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: '#1a202c',
            color: '#e2e8f0',
            border: '1px solid #4a5568',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: loading || isScanRunning ? 'not-allowed' : 'pointer',
            opacity: loading || isScanRunning ? 0.5 : 1,
            outline: 'none',
          }}
        >
          <option value="">-- Selecciona un Prompt Predefinido o Escribe Uno Personalizado --</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Textarea para Prompt Editable */}
      <textarea
        value={prompt}
        onChange={handleTextareaChange}
        disabled={loading || isScanRunning}
        placeholder="Ej: Quiero auditoría de encabezados y escanear si hay variables de entorno expuestas..."
        rows={4}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#171923',
          color: '#ffffff',
          border: '1px solid #2d3748',
          borderRadius: '6px',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          resize: 'vertical',
          opacity: loading || isScanRunning ? 0.5 : 1,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Botón Estilizado */}
      <button
        onClick={handleGenerateSuite}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: '700',
          letterSpacing: '0.5px',
          color: '#ffffff',
          background: isDisabled
            ? '#2d3748'
            : isHovered
            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
            : 'linear-gradient(135deg, #047857 0%, #059669 100%)',
          border: isDisabled ? '1px solid #4a5568' : '1px solid #34d399',
          borderRadius: '8px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: isDisabled
            ? 'none'
            : isHovered
            ? '0 0 18px rgba(16, 185, 129, 0.55)'
            : '0 0 10px rgba(16, 185, 129, 0.3)',
          transform: !isDisabled && isHovered ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'all 0.25s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            <span>Generando Suite con Gemini AI...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Crear Suite con IA</span>
          </>
        )}
      </button>
    </div>
  );
};