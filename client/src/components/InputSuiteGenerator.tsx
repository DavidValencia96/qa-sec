import React, { useEffect, useState } from 'react';
import { generateSuiteAIApi, getPromptsApi } from '../services/api.client';

interface InputSuiteGeneratorProps {
  projectId: string;
  isScanRunning?: boolean;
  onSuiteCreated: (suiteId: string) => void;
  promptValue?: string;
  selectedPresetValue?: string;
  onPromptChange?: (promptText: string, presetId: string) => void;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

interface PromptPreset {
  id: string;
  name: string;
  prompt_text: string;
}

export const InputSuiteGenerator: React.FC<InputSuiteGeneratorProps> = ({
  projectId,
  isScanRunning = false,
  onSuiteCreated,
  promptValue = '',
  selectedPresetValue = '',
  onPromptChange,
  onGeneratingChange,
}) => {
  const [prompts, setPrompts] = useState<PromptPreset[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(selectedPresetValue);
  const [customPrompt, setCustomPrompt] = useState<string>(promptValue);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingPrompts, setFetchingPrompts] = useState<boolean>(true);
  const [errorPrompts, setErrorPrompts] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const [prevPromptValue, setPrevPromptValue] = useState(promptValue);
  const [prevPresetValue, setPrevPresetValue] = useState(selectedPresetValue);

  if (promptValue !== prevPromptValue) {
    setPrevPromptValue(promptValue);
    setCustomPrompt(promptValue);
  }

  if (selectedPresetValue !== prevPresetValue) {
    setPrevPresetValue(selectedPresetValue);
    setSelectedPromptId(selectedPresetValue);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPrompts() {
      try {
        const data = await getPromptsApi();
        if (isMounted) {
          if (data && data.success && Array.isArray(data.prompts)) {
            setPrompts(data.prompts);
            setErrorPrompts(null);
          } else {
            throw new Error('Formato de respuesta inválido o sin registros en la tabla input_prompts.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorPrompts((err as Error).message);
        }
      } finally {
        if (isMounted) {
          setFetchingPrompts(false);
        }
      }
    }

    loadPrompts();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  const handleRetryFetch = () => {
    setFetchingPrompts(true);
    setReloadTrigger((prev) => prev + 1);
  };

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedPromptId(selectedId);
    const preset = prompts.find((p) => p.id === selectedId);
    const newText = preset ? preset.prompt_text : '';
    setCustomPrompt(newText);
    if (onPromptChange) onPromptChange(newText, selectedId);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCustomPrompt(newText);
    setSelectedPromptId('');
    if (onPromptChange) onPromptChange(newText, '');
  };

  const handleGenerateSuite = async () => {
    const finalPrompt = customPrompt.trim();
    if (!finalPrompt) return alert('Por favor selecciona o escribe una regla de auditoría.');

    setLoading(true);
    if (onGeneratingChange) onGeneratingChange(true);

    try {
      const data = await generateSuiteAIApi(projectId, finalPrompt, selectedPromptId);
      if (data.success) {
        onSuiteCreated(data.suiteId);
      } else {
        alert(`Error al configurar la suite: ${data.error || 'Desconocido'}`);
      }
    } catch (err) {
      alert(`Error de conexión: ${(err as Error).message}`);
    } finally {
      setLoading(false);
      if (onGeneratingChange) onGeneratingChange(false);
    }
  };

  const isDisabled = isScanRunning || loading || fetchingPrompts || !customPrompt.trim();

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
          <span style={{ color: '#38bdf8' }}>🤖</span> Diseñador de Pruebas de Inputs con Gemini AI
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
          Selecciona una regla de auditoría almacenada en MySQL:
        </label>

        {fetchingPrompts ? (
          <p style={{ color: '#38bdf8', fontSize: '0.82rem' }}>🔄 Cargando reglas desde la base de datos...</p>
        ) : errorPrompts ? (
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#f87171', fontSize: '0.82rem', margin: '0 0 6px 0' }}>⚠️ {errorPrompts}</p>
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
              Reintentar carga DB
            </button>
          </div>
        ) : (
          <select
            value={selectedPromptId}
            onChange={handleSelectPreset}
            disabled={isScanRunning || loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(2, 6, 23, 0.9)',
              border: '1px solid rgba(30, 41, 59, 0.9)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: isScanRunning || loading ? 'not-allowed' : 'pointer',
              opacity: isScanRunning || loading ? 0.5 : 1,
              marginBottom: '12px',
            }}
          >
            <option value="">-- Selecciona una Regla desde la Base de Datos ({prompts.length} disponibles) --</option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                🔑 {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <textarea
        rows={4}
        value={customPrompt}
        onChange={handleTextareaChange}
        disabled={isScanRunning || loading}
        placeholder="Regla de auditoría que se enviará al backend/IA..."
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
          opacity: isScanRunning || loading ? 0.5 : 1,
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: '16px',
          fontFamily: 'monospace',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleGenerateSuite}
          disabled={isDisabled}
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
              : 'rgba(2, 132, 199, 0.85)',
            border: isDisabled ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(56, 189, 248, 0.6)',
            borderRadius: '8px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            boxShadow: isDisabled ? 'none' : '0 0 12px rgba(2, 132, 199, 0.3)',
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
              <span>Configurando Suite...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Configurar Suite de Sanitización</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};