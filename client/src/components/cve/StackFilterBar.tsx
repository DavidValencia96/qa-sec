import React, { useState } from 'react';

interface StackFilterBarProps {
  selectedKeyword: string;
  onFilterSubmit: (keyword: string, startDate?: string, endDate?: string) => void;
  disabled: boolean;
}

const STACK_OPTIONS = [
  { label: '🌐 Todos', value: '' },
  { label: '🟢 Node.js', value: 'node.js' },
  { label: '⚡ Express', value: 'express' },
  { label: '🐬 MySQL', value: 'mysql' },
  { label: '⚛️ React', value: 'react' },
  { label: '⚙️ Nginx', value: 'nginx' },
  { label: '🐍 Python', value: 'python' },
];

export const StackFilterBar: React.FC<StackFilterBarProps> = ({
  selectedKeyword,
  onFilterSubmit,
  disabled,
}) => {
  const [customInput, setCustomInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Requisito estricto: El input debe tener al menos 1 carácter válido
    if (customInput.trim().length >= 1) {
      onFilterSubmit(customInput.trim().toLowerCase(), startDate || undefined, endDate || undefined);
    }
  };

  const handleQuickSelect = (value: string) => {
    setCustomInput('');
    onFilterSubmit(value, startDate || undefined, endDate || undefined);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
      {/* Botones rápidos */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {STACK_OPTIONS.map((opt) => {
          const isActive = selectedKeyword === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleQuickSelect(opt.value)}
              disabled={disabled}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: isActive ? '1px solid #38bdf8' : '1px solid #3f3f46',
                background: isActive ? '#0284c7' : '#18181b',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: isActive ? 'bold' : 'normal',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Formulario de búsqueda personalizada con rango de fechas opcional */}
      <form
        onSubmit={handleCustomSearch}
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: '#18181b',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #27272a',
        }}
      >
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Tecnología (Mínimo 1 carácter):</label>
          <input
            type="text"
            placeholder="Ej. wordpress, php, java, docker..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={disabled}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #3f3f46',
              background: '#09090b',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Fecha Inicio (Opcional) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Desde (Opcional):</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={disabled}
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid #3f3f46',
              background: '#09090b',
              color: '#fff',
              fontSize: '0.85rem',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Fecha Fin (Opcional) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Hasta (Opcional):</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={disabled}
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid #3f3f46',
              background: '#09090b',
              color: '#fff',
              fontSize: '0.85rem',
              colorScheme: 'dark',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || customInput.trim().length === 0}
          style={{
            alignSelf: 'flex-end',
            padding: '8px 18px',
            height: '35px',
            borderRadius: '6px',
            border: 'none',
            background: disabled || customInput.trim().length === 0 ? '#27272a' : '#0284c7',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: disabled || customInput.trim().length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          🔎 Buscar
        </button>
      </form>

      {/* Badge informativo de filtros activos */}
      {selectedKeyword && (
        <div style={{ fontSize: '0.85rem', color: '#38bdf8' }}>
          Filtrando activamente por: <strong>"{selectedKeyword}"</strong>
          {startDate && endDate && (
            <span> | Rango: <strong>{startDate}</strong> a <strong>{endDate}</strong></span>
          )}
        </div>
      )}
    </div>
  );
};