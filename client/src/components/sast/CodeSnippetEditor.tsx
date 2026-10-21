import React, { useState } from 'react';

interface CodeSnippetEditorProps {
  onAnalyze: (code: string, fileName: string, fileType: 'code' | 'env' | 'package_json', language: string) => void;
  disabled: boolean;
  initialCode?: string;
  initialFileName?: string;
  initialLanguage?: string;
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

export const CodeSnippetEditor: React.FC<CodeSnippetEditorProps> = ({
  onAnalyze,
  disabled,
  initialCode = '',
  initialFileName = 'snippet.ts',
  initialLanguage = 'typescript',
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [fileName, setFileName] = useState<string>(initialFileName);
  const [fileType, setFileType] = useState<'code' | 'env' | 'package_json'>('code');
  const [language, setLanguage] = useState<string>(initialLanguage);

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
            Nombre de archivo:
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ flex: '0 1 180px' }}>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
            Lenguaje:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#38bdf8',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
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
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
            Cargar archivo (.env, package.json, code):
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={disabled}
            style={{
              fontSize: '0.85rem',
              color: '#94a3b8',
              cursor: 'pointer',
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
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: 'rgba(9, 9, 11, 0.7)',
          color: '#38bdf8',
          fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
          fontSize: '0.88rem',
          lineHeight: '1.6',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      <button
        type="submit"
        disabled={disabled || code.trim().length === 0}
        style={{
          alignSelf: 'flex-start',
          padding: '12px 24px',
          borderRadius: '8px',
          border: '1px solid #38bdf8',
          background: disabled || code.trim().length === 0 ? 'rgba(51, 65, 85, 0.6)' : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '0.92rem',
          cursor: disabled || code.trim().length === 0 ? 'not-allowed' : 'pointer',
          boxShadow: disabled || code.trim().length === 0 ? 'none' : '0 0 15px rgba(56, 189, 248, 0.35)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🛡️ Ejecutar Escaneo SAST & Secret Scanning
      </button>
    </form>
  );
};