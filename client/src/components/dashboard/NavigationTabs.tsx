import React from 'react';
import type { TabType } from './dashboard.types';
export type { TabType };

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'scanner', label: 'Escáner Web', icon: '🚀' },
    { id: 'injection', label: 'Inputs Sec', icon: '🎯' },
    { id: 'network', label: 'Red & Puertos', icon: '🛡️' },
    { id: 'cve', label: 'CVE Radar', icon: '📰' },
    { id: 'sast', label: 'SAST & Code', icon: '🔍' },
    { id: 'load-test', label: 'Carga & DoS', icon: '💥' },
    { id: 'dast', label: 'DAST API', icon: '🛡️' },
    { id: 'sca', label: 'SCA & Supply', icon: '🔐' },
    { id: 'easm', label: 'EASM OSINT', icon: '🕸️' },
    { id: 'redteam', label: 'Red Team', icon: '⚔️' },
    { id: 'emailsec', label: 'Email Sec', icon: '📧' },
    { id: 'compliance', label: 'Compliance', icon: '📊' },
    { id: 'history', label: 'Historial', icon: '📜' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '28px',
        width: '100%',
        overflowX: 'auto',
        padding: '10px 14px',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        boxSizing: 'border-box',
        scrollbarWidth: 'thin',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.82rem',
              fontWeight: isActive ? '700' : '500',
              cursor: 'pointer',
              backgroundColor: isActive ? 'rgba(37, 99, 235, 0.4)' : 'rgba(15, 23, 42, 0.5)',
              color: isActive ? '#ffffff' : '#94a3b8',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};