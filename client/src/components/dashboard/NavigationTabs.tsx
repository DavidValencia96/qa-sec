import React from 'react';
import type { TabType } from './dashboard.types';
export type { TabType };

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
        onClick={() => onTabChange('home')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'home' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'home' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🏠 Inicio
      </button>

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
        onClick={() => onTabChange('load-test')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'load-test' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'load-test' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        💥 Pruebas de Carga & DoS
      </button>

      <button
        type="button"
        onClick={() => onTabChange('dast')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'dast' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'dast' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🛡️ DAST & OpenAPI Fuzzer
      </button>

      <button
        type="button"
        onClick={() => onTabChange('sca')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'sca' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'sca' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🔐 SCA & Supply Chain Sec
      </button>

      <button
        type="button"
        onClick={() => onTabChange('easm')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'easm' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'easm' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        🕸️ EASM & Recon OSINT
      </button>

      <button
        type="button"
        onClick={() => onTabChange('redteam')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'redteam' ? '#2563eb' : '#27272a',
          color: '#ffffff',
        }}
      >
        ⚔️ Red Team & Explotación
      </button>

      <button
        type="button"
        onClick={() => onTabChange('emailsec')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'emailsec' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'emailsec' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        📧 Email Sec & OSINT
      </button>

      <button
        type="button"
        onClick={() => onTabChange('compliance')}
        style={{
          padding: '10px 18px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          backgroundColor: activeTab === 'compliance' ? '#2563eb' : '#27272a',
          color: '#ffffff',
          boxShadow: activeTab === 'compliance' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        📊 Compliance Radar
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