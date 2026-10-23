import React, { useState, useEffect } from 'react';
import { getPromptPresetsApi, generateSuiteAIApi } from '../services/api.client';

interface PromptPreset {
  id: number;
  title: string;
  prompt_text: string;
  category?: string;
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
  promptValue?: string;
  selectedPresetValue?: string;
  onPromptChange?: (promptText: string, presetId: string) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

export const AISuiteGenerator: React.FC<AISuiteGeneratorProps> = ({
  projectId,
  onSuiteGenerated,
  onSuiteCreated,
  isScanRunning = false,
  promptValue = '',
  selectedPresetValue = '',
  onPromptChange,
  onGeneratingChange,
}) => {
  const [prompt, setPrompt] = useState<string>(promptValue);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(selectedPresetValue);

  const [prevPromptValue, setPrevPromptValue] = useState(promptValue);
  const [prevPresetValue, setPrevPresetValue] = useState(selectedPresetValue);

  if (promptValue !== prevPromptValue) {
    setPrevPromptValue(promptValue);
    setPrompt(promptValue);
  }

  if (selectedPresetValue !== prevPresetValue) {
    setPrevPresetValue(selectedPresetValue);
    setSelectedPresetId(selectedPresetValue);
  }

  const [presets, setPresets] = useState<PromptPreset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingPresets, setFetchingPresets] = useState<boolean>(true);
  const [errorPresets, setErrorPresets] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadPresets = async () => {
      try {
        const data = await getPromptPresetsApi();
        if (isMounted) {
          if (data && data.success && Array.isArray(data.presets)) {
            setPresets(data.presets);
            setErrorPresets(null);
          } else {
            throw new Error('Respuesta inválida o sin datos en prompt_presets.');
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error al cargar plantillas de prompts:', error);
          setErrorPresets((error as Error).message);
        }
      } finally {
        if (isMounted) {
          setFetchingPresets(false);
        }
      }
    };

    loadPresets();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const handleRetryFetch = () => {
    setFetchingPresets(true);
    setReloadTrigger((prev) => prev + 1);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);

    if (!presetId) {
      setPrompt('');
      if (onPromptChange) onPromptChange('', '');
      return;
    }

    const foundPreset = presets.find((p) => String(p.id) === presetId);
    if (foundPreset) {
      setPrompt(foundPreset.prompt_text);
      if (onPromptChange) onPromptChange(foundPreset.prompt_text, presetId);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPrompt(newText);
    setSelectedPresetId('');
    if (onPromptChange) onPromptChange(newText, '');
  };

  const handleGenerateSuite = async () => {
    if (!prompt.trim() || !projectId || loading || isScanRunning) return;

    setLoading(true);
    if (onGeneratingChange) onGeneratingChange(true);

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
      if (onGeneratingChange) onGeneratingChange(false);
    }
  };

  const isDisabled = loading || isScanRunning || !prompt.trim() || !projectId || fetchingPresets;

  return (
    <div
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        padding: '22px 24px',
        borderRadius: '14px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        marginTop: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: '#f8fafc',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#38bdf8' }}>🤖</span> Diseñador de Pruebas con Gemini AI
        </h3>
        <span
          style={{
            backgroundColor: 'rgba(14, 165, 233, 0.15)',
            color: '#38bdf8',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          Gemini Active
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: '#94a3b8' }}>
          Plantillas de Prompts Recomendados:
        </label>

        {fetchingPresets ? (
          <p style={{ color: '#38bdf8', fontSize: '0.82rem' }}>🔄 Cargando plantillas desde la base de datos...</p>
        ) : errorPresets ? (
          <div style={{ marginBottom: '8px' }}>
            <p style={{ color: '#f87171', fontSize: '0.82rem', margin: '0 0 6px 0' }}>⚠️ {errorPresets}</p>
            <button
              type="button"
              onClick={handleRetryFetch}
              style={{
                backgroundColor: 'rgba(51, 65, 85, 0.6)',
                color: '#f8fafc',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Reintentar Carga
            </button>
          </div>
        ) : (
          <select
            value={selectedPresetId}
            onChange={handlePresetChange}
            disabled={loading || isScanRunning}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(2, 6, 23, 0.9)',
              border: '1px solid rgba(30, 41, 59, 0.9)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: loading || isScanRunning ? 'not-allowed' : 'pointer',
              opacity: loading || isScanRunning ? 0.5 : 1,
            }}
          >
            <option value="">
              -- Selecciona un Prompt Predefinido o Escribe Uno Personalizado ({presets.length} disponibles) --
            </option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <textarea
        value={prompt}
        onChange={handleTextareaChange}
        disabled={loading || isScanRunning}
        placeholder="Ej: Quiero auditoría de encabezados y escanear si hay variables de entorno expuestas..."
        rows={4}
        style={{
          width: '100%',
          padding: '10px 14px',
          backgroundColor: 'rgba(2, 6, 23, 0.9)',
          color: '#e2e8f0',
          border: '1px solid rgba(30, 41, 59, 0.9)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          lineHeight: '1.5',
          resize: 'vertical',
          opacity: loading || isScanRunning ? 0.5 : 1,
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          marginBottom: '16px',
        }}
      />

      {/* CONTENEDOR CENTRADO PARA EL BOTÓN CREAR SUITE */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleGenerateSuite}
          disabled={isDisabled}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            color: '#ffffff',
            backgroundColor: isDisabled
              ? 'rgba(30, 41, 59, 0.5)'
              : isHovered
              ? '#0284c7'
              : 'rgba(2, 132, 199, 0.85)',
            border: isDisabled ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(56, 189, 248, 0.6)',
            borderRadius: '8px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            boxShadow: isDisabled
              ? 'none'
              : isHovered
              ? '0 0 14px rgba(2, 132, 199, 0.45)'
              : '0 0 8px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.2s ease',
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
    </div>
  );
};