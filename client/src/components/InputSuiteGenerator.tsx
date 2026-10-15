import React, { useEffect, useState } from 'react';
import { generateSuiteAIApi, getPromptsApi } from '../services/api.client';

interface InputSuiteGeneratorProps {
  projectId: string;
  isScanRunning: boolean;
  onSuiteCreated: (suiteId: string) => void;
}

interface PromptPreset {
  id: string;
  name: string;
  prompt_text: string;
}

export const InputSuiteGenerator: React.FC<InputSuiteGeneratorProps> = ({
  projectId,
  isScanRunning,
  onSuiteCreated,
}) => {
  const [prompts, setPrompts] = useState<PromptPreset[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingPrompts, setFetchingPrompts] = useState<boolean>(true);
  const [errorPrompts, setErrorPrompts] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

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
    setCustomPrompt(preset ? preset.prompt_text : '');
  };

  const handleGenerateSuite = async () => {
    const finalPrompt = customPrompt.trim();
    if (!finalPrompt) return alert('Por favor selecciona o escribe una regla de auditoría.');

    setLoading(true);
    try {
      // Se transmite selectedPromptId hacia el backend
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
    }
  };

  return (
    <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a', marginTop: '20px' }}>
      <h3 style={{ marginTop: 0, color: '#38bdf8' }}>🤖 Diseñador de Pruebas de Inputs con Gemini AI</h3>
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '16px' }}>
        Selecciona una regla de auditoría almacenada en MySQL:
      </p>

      {fetchingPrompts ? (
        <p style={{ color: '#60a5fa', fontSize: '0.85rem' }}>🔄 Cargando reglas desde la base de datos...</p>
      ) : errorPrompts ? (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 6px 0' }}>⚠️ {errorPrompts}</p>
          <button
            onClick={handleRetryFetch}
            style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}
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
            padding: '10px',
            background: '#09090b',
            color: '#fff',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            marginBottom: '12px',
          }}
        >
          <option value="">-- Selecciona una Regla desde la Base de Datos ({prompts.length} disponibles) --</option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <textarea
        rows={3}
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        disabled={isScanRunning || loading}
        placeholder="Regla de auditoría que se enviará al backend/IA..."
        style={{
          width: '100%',
          padding: '10px',
          background: '#09090b',
          color: '#fff',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          boxSizing: 'border-box',
          marginBottom: '16px',
        }}
      />

      <button
        onClick={handleGenerateSuite}
        disabled={isScanRunning || loading || fetchingPrompts}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? '#374151' : '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Configurando Suite...' : '✨ Configurar Suite de Sanitización'}
      </button>
    </div>
  );
};