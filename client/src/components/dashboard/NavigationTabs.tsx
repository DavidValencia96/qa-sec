import React, { useState, useRef, useEffect } from 'react';
import type { TabType } from './dashboard.types';
import { useAuth } from '../../context/useAuth.js';
import { LoginOtpModal } from '../auth/LoginOtpModal.js';
export type { TabType };

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabGroup {
  id: string;
  label: string;
  icon: string;
  tabs: Array<{ id: TabType; label: string; icon: string }>;
}

const PUBLIC_TABS: TabType[] = ['home', 'scanner', 'injection'];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groups: TabGroup[] = [
    {
      id: 'web-audit',
      label: 'Escáneres Web & DAST',
      icon: '🚀',
      tabs: [
        { id: 'scanner', label: 'Escáner Web General', icon: '🚀' },
        { id: 'injection', label: 'Inputs & Sanitización Sec', icon: '🎯' },
      ],
    },
    {
      id: 'network-api',
      label: 'Seguridad Red & API',
      icon: '🌐',
      tabs: [
        { id: 'network', label: 'Red & Puertos', icon: '🛡️' },
        { id: 'dast', label: 'DAST API / OpenAPI', icon: '⚡' },
        { id: 'load-test', label: 'Pruebas Carga & DoS', icon: '💥' },
      ],
    },
    {
      id: 'code-supply',
      label: 'Código & Supply Chain',
      icon: '🔍',
      tabs: [
        { id: 'sast', label: 'SAST & Code Audit', icon: '🔍' },
        { id: 'sca', label: 'SCA & Supply Chain', icon: '🔐' },
        { id: 'cve', label: 'CVE Radar', icon: '📰' },
      ],
    },
    {
      id: 'advanced-attack',
      label: 'Ataque Avanzado & OSINT',
      icon: '⚔️',
      tabs: [
        { id: 'easm', label: 'EASM OSINT Recon', icon: '🕸️' },
        { id: 'redteam', label: 'Red Team & Explotación', icon: '⚔️' },
        { id: 'emailsec', label: 'Email Sec & Defense', icon: '📧' },
      ],
    },
  ];

  const isDirectTab = activeTab === 'home' || activeTab === 'compliance' || activeTab === 'history' || activeTab === 'admin';

  const getActiveTabLabel = (): { label: string; icon: string } => {
    if (activeTab === 'home') return { label: 'Inicio', icon: '🏠' };
    if (activeTab === 'compliance') return { label: 'Compliance Radar', icon: '📊' };
    if (activeTab === 'history') return { label: 'Historial Centralizado', icon: '📜' };
    if (activeTab === 'admin') return { label: 'Admin RBAC', icon: '🛡️' };

    for (const g of groups) {
      const found = g.tabs.find((t) => t.id === activeTab);
      if (found) return { label: found.label, icon: found.icon };
    }
    return { label: 'Inicio', icon: '🏠' };
  };

  const activeInfo = getActiveTabLabel();

  const handleSelectTab = (tabId: TabType) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);

    if (PUBLIC_TABS.includes(tabId) || user) {
      onTabChange(tabId);
      return;
    }
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="nav-tabs-wrapper"
        style={{
          width: '100%',
          marginBottom: '28px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '10px 16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* VISTA MÓVIL: BOTÓN HAMBURGUESA + MÓDULO ACTIVO */}
        <div className="mobile-nav-trigger">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)',
            }}
          >
            <span>{mobileMenuOpen ? '✕' : '☰'}</span>
            <span>Navegación</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(2, 6, 23, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '6px 12px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Activo:</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {activeInfo.icon} {activeInfo.label}
            </span>
          </div>
        </div>

        {/* MENÚ DE PESTAÑAS */}
        <div className={`nav-tabs-content ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            {/* 1. INICIO */}
            <button
              type="button"
              onClick={() => handleSelectTab('home')}
              style={{
                backgroundColor: activeTab === 'home' ? '#0284c7' : 'rgba(2, 6, 23, 0.6)',
                color: '#ffffff',
                border: activeTab === 'home' ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.7)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'home' ? 'bold' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'home' ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🏠</span>
              <span>Inicio</span>
            </button>

            {/* 2. GRUPOS DROPDOWN */}
            {groups.map((group) => {
              const isGroupActive = !isDirectTab && group.tabs.some((t) => t.id === activeTab);
              const isOpen = openDropdown === group.id;

              return (
                <div key={group.id} style={{ position: 'relative' }} className="nav-group-item">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    style={{
                      backgroundColor: isGroupActive ? '#0284c7' : isOpen ? 'rgba(30, 41, 59, 0.8)' : 'rgba(2, 6, 23, 0.6)',
                      color: '#ffffff',
                      border: isGroupActive ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.7)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      fontWeight: isGroupActive ? 'bold' : '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isGroupActive ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                  >
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* SUBMENÚ */}
                  {isOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        minWidth: '220px',
                        backgroundColor: '#090d16',
                        border: '1px solid #0284c7',
                        borderRadius: '10px',
                        padding: '6px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(16px)',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                      className="nav-sub-dropdown"
                    >
                      {group.tabs.map((tab) => {
                        const isTabSelected = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleSelectTab(tab.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              backgroundColor: isTabSelected ? 'rgba(2, 132, 199, 0.25)' : 'transparent',
                              color: isTabSelected ? '#38bdf8' : '#e2e8f0',
                              border: isTabSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              fontWeight: isTabSelected ? 'bold' : 'normal',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 3. COMPLIANCE */}
            <button
              type="button"
              onClick={() => handleSelectTab('compliance')}
              style={{
                backgroundColor: activeTab === 'compliance' ? '#0284c7' : 'rgba(2, 6, 23, 0.6)',
                color: '#ffffff',
                border: activeTab === 'compliance' ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.7)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'compliance' ? 'bold' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'compliance' ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>📊</span>
              <span>Compliance</span>
            </button>

            {/* 4. HISTORIAL */}
            <button
              type="button"
              onClick={() => handleSelectTab('history')}
              style={{
                backgroundColor: activeTab === 'history' ? '#0284c7' : 'rgba(2, 6, 23, 0.6)',
                color: '#ffffff',
                border: activeTab === 'history' ? '1px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.7)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'history' ? 'bold' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'history' ? '0 0 12px rgba(2, 132, 199, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>📜</span>
              <span>Historial</span>
            </button>

            {/* 5. ADMIN RBAC (Visible solo para administradores) */}
            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => handleSelectTab('admin')}
                style={{
                  backgroundColor: activeTab === 'admin' ? '#581c87' : 'rgba(88, 28, 135, 0.35)',
                  color: '#e9d5ff',
                  border: activeTab === 'admin' ? '1px solid #c084fc' : '1px solid rgba(192, 132, 252, 0.4)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'admin' ? '0 0 12px rgba(192, 132, 252, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>🛡️</span>
                <span>Admin RBAC</span>
              </button>
            )}
          </div>
        </div>

        {/* PILL DE MÓDULO ACTIVO (DESKTOP) */}
        <div className="desktop-active-pill">
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Activo:</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {activeInfo.icon} {activeInfo.label}
          </span>
        </div>
      </div>

      <LoginOtpModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default NavigationTabs;