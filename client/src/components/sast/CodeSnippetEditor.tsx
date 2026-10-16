import React, { useState } from 'react';

interface CodeSnippetEditorProps {
  onAnalyze: (code: string, fileName: string, fileType: 'code' | 'env' | 'package_json', language: string) => void;
  disabled: boolean;
}

const LANGUAGE_OPTIONS = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'SQL', value: 'sql' },
  { label: 'JSON', value: 'json' },
  { label: 'HTML / CSS', value: 'html' },
  { label: 'Otro / Auto-detectar', value: 'auto' },
];

export const CodeSnippetEditor: React.FC<CodeSnippetEditorProps> = ({ onAnalyze, disabled }) => {
  const [code, setCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('snippet.ts');
  const [fileType, setFileType] = useState<'code' | 'env' | 'package_json'>('code');
  const [language, setLanguage] = useState<string>('typescript');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (file.name.endsWith('.env')) setFileType('env');
    else if (file.name.endsWith('package.json')) setFileType('package_json');
    else setFileType('code');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setCode(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length > 0) {
      onAnalyze(code, fileName, fileType, language);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
            Nombre de archivo:
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #3f3f46',
              background: '#09090b',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ flex: '0 1 180px' }}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
            Lenguaje:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #3f3f46',
              background: '#09090b',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
            Cargar archivo (.env, package.json, code):
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={disabled}
            style={{
              fontSize: '0.85rem',
              color: '#9ca3af',
            }}
          />
        </div>
      </div>

      <textarea
        rows={10}
        placeholder="Pega aquí tu código, archivo .env o package.json para auditar..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #3f3f46',
          background: '#09090b',
          color: '#38bdf8',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          outline: 'none',
          resize: 'vertical',
        }}
      />

      <button
        type="submit"
        disabled={disabled || code.trim().length === 0}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none',
          background: disabled || code.trim().length === 0 ? '#27272a' : '#0284c7',
          color: '#fff',
          fontWeight: 'bold',
          cursor: disabled || code.trim().length === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        🛡️ Ejecutar Escaneo SAST & Secret Scanning
      </button>
    </form>
  );
};