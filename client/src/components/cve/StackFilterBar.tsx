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
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 'bold' : 'normal',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                background: isActive
                  ? 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)'
                  : 'rgba(15, 23, 42, 0.6)',
                color: isActive ? '#ffffff' : '#94a3b8',
                border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Formulario de búsqueda personalizada */}
      <form
        onSubmit={handleCustomSearch}
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          background: 'rgba(9, 9, 11, 0.6)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
        }}
      >
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 'bold' }}>Tecnología (Mínimo 1 carácter):</label>
          <input
            type="text"
            placeholder="Ej. wordpress, php, java, docker..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={disabled}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Fecha Inicio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 'bold' }}>Desde (Opcional):</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={disabled}
            style={{
              padding: '9px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.88rem',
              colorScheme: 'dark',
              outline: 'none',
            }}
          />
        </div>

        {/* Fecha Fin */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 'bold' }}>Hasta (Opcional):</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={disabled}
            style={{
              padding: '9px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#fff',
              fontSize: '0.88rem',
              colorScheme: 'dark',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || customInput.trim().length === 0}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid #38bdf8',
            background: disabled || customInput.trim().length === 0 ? 'rgba(51, 65, 85, 0.6)' : 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)',
            color: '#fff',
            fontSize: '0.88rem',
            fontWeight: 'bold',
            cursor: disabled || customInput.trim().length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: disabled || customInput.trim().length === 0 ? 'none' : '0 0 12px rgba(56, 189, 248, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          🔎 Buscar
        </button>
      </form>

      {/* Badge informativo de filtros activos */}
      {selectedKeyword && (
        <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
          Filtrando activamente por: <strong style={{ color: '#ffffff' }}>"{selectedKeyword}"</strong>
          {startDate && endDate && (
            <span> | Rango: <strong style={{ color: '#ffffff' }}>{startDate}</strong> a <strong style={{ color: '#ffffff' }}>{endDate}</strong></span>
          )}
        </div>
      )}
    </div>
  );
};