import React from 'react';
import { useLanguage } from '../../context/useLanguage';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(2, 6, 23, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '8px',
        padding: '2px',
        gap: '2px',
        boxShadow: '0 0 10px rgba(2, 132, 199, 0.15)',
      }}
    >
      <button
        type="button"
        onClick={() => setLanguage('es')}
        style={{
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 800,
          fontFamily: 'monospace',
          transition: 'all 0.15s ease',
          backgroundColor: language === 'es' ? '#0284c7' : 'transparent',
          color: language === 'es' ? '#ffffff' : '#94a3b8',
          boxShadow: language === 'es' ? '0 0 8px rgba(56, 189, 248, 0.4)' : 'none',
        }}
      >
        ES
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        style={{
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 800,
          fontFamily: 'monospace',
          transition: 'all 0.15s ease',
          backgroundColor: language === 'en' ? '#0284c7' : 'transparent',
          color: language === 'en' ? '#ffffff' : '#94a3b8',
          boxShadow: language === 'en' ? '0 0 8px rgba(56, 189, 248, 0.4)' : 'none',
        }}
      >
        EN
      </button>
    </div>
  );
};