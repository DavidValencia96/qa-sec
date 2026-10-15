import React from 'react';

export type TabType = 'scanner' | 'injection' | 'network' | 'history';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        width: '100%',
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={() => onTabChange('scanner')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'scanner' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'scanner' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🚀 Escáner & Diseñador IA
      </button>

      {/* NUEVA PESTAÑA DEDICADA A INPUTS / INYECCIÓN */}
      <button
        onClick={() => onTabChange('injection')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'injection' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'injection' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🎯 Inyección & Inputs Sec
      </button>

      <button
        onClick={() => onTabChange('network')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'network' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'network' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🛡️ Configuración de Red
      </button>

      <button
        onClick={() => onTabChange('history')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'history' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'history' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        📜 Historial de Reportes
      </button>
    </div>
  );
};