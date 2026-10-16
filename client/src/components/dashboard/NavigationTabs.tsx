import React from 'react';

export type TabType = 'scanner' | 'injection' | 'network' | 'cve' | 'sast' | 'history';

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
        type="button"
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

      <button
        type="button"
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
        type="button"
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
        type="button"
        onClick={() => onTabChange('cve')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'cve' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'cve' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        📰 CiberThreat Feed & CVE Radar
      </button>

      <button
        type="button"
        onClick={() => onTabChange('sast')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'sast' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'sast' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🔍 Auditoría SAST & Secret Scanning
      </button>

      <button
        type="button"
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