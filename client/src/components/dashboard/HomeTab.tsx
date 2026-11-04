import React from 'react';
import type { TabType } from './dashboard.types';
import { useLanguage } from '../../context/useLanguage';

interface HomeTabProps {
  onNavigate: (tab: TabType) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const modules = [
    {id: 'scanner' as TabType,title: t.modules.scanner.title,icon: '🚀',desc: t.modules.scanner.desc,category: t.modules.scanner.badge,},
    {id: 'injection' as TabType, title: t.modules.injection.title, icon: '🎯', desc: t.modules.injection.desc, category: t.modules.injection.badge,},
    {id: 'network' as TabType,title: t.modules.network.title,icon: '🛡️',desc: t.modules.network.desc,category: t.modules.network.badge,},
    {id: 'cve' as TabType,title: t.modules.cve.title,icon: '📰',desc: t.modules.cve.desc,category: t.modules.cve.badge,},
    {id: 'sast' as TabType,title: t.modules.sast.title,icon: '🔍',desc: t.modules.sast.desc,category: t.modules.sast.badge,},
    {id: 'load-test' as TabType,title: t.modules.loadTest.title,icon: '💥',desc: t.modules.loadTest.desc,category: t.modules.loadTest.badge,},
    {id: 'dast' as TabType,title: t.modules.dast.title,icon: '🛡️',desc: t.modules.dast.desc,category: t.modules.dast.badge,},
    {id: 'sca' as TabType,title: t.modules.sca.title,icon: '🔐',desc: t.modules.sca.desc,category: t.modules.sca.badge,},
    {id: 'easm' as TabType,title: t.modules.easm.title,icon: '🕸️',desc: t.modules.easm.desc,category: t.modules.easm.badge,},
    {id: 'redteam' as TabType,title: t.modules.redteam.title,icon: '⚔️',desc: t.modules.redteam.desc,category: t.modules.redteam.badge,},
    {id: 'emailsec' as TabType,title: t.modules.emailsec.title,icon: '📧',desc: t.modules.emailsec.desc,category: t.modules.emailsec.badge,},
    {id: 'compliance' as TabType,title: t.modules.compliance.title,icon: '📊',desc: t.modules.compliance.desc,category: t.modules.compliance.badge,},
  ];

  return (
    <div style={{ padding: '10px 0' }}>
      {/* HERO SECTION CON GLASSMORPHISM TRANSPARENTE */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.35) 50%, rgba(9, 9, 11, 0.3) 100%)',
          backdropFilter: 'blur(8px)',
          padding: '40px 32px',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.15)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.6)', padding: '6px 14px', borderRadius: '20px', border: '1px solid #38bdf8', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              {t.homeSystemOperational}
            </span>
          </div>

          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            {t.homeHeroTitle1} <span style={{ color: '#38bdf8' }}> {t.homeHeroTitle2}</span>
          </h1>

          <p style={{ color: '#e2e8f0', fontSize: '1.05rem', maxWidth: '750px', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            {t.homeHeroDesc}
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              style={{
                padding: '12px 24px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              🚀 {t.homeBtnStartWebAudit}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('compliance')}
              style={{
                padding: '12px 24px',
                background: 'rgba(15, 23, 42, 0.5)',
                color: '#38bdf8',
                border: '1px solid #38bdf8',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              📊 {t.homeBtnViewCompliance}
            </button>
          </div>
        </div>
      </div>

      {/* METRICAS RAPIDAS DE CABECERA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: t.homeStatModulesLabel, val: t.homeStatModulesValue, color: '#fff' },
          { label: t.homeStatAiLabel, val: t.homeStatAiValue, color: '#38bdf8' },
          { label: t.homeStatCicdLabel, val: t.homeStatCicdValue, color: '#22c55e' },
          { label: t.homeStatStandardsLabel, val: t.homeStatStandardsValue, color: '#facc15' },
        ].map((kpi, idx) => (
          <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(6px)', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>{kpi.label}</span>
            <strong style={{ color: kpi.color, fontSize: '1.8rem' }}>{kpi.val}</strong>
          </div>
        ))}
      </div>

      {/* GRID DE CARDS TRANSPARENTES */}
      <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚙️ {t.homeModulesSectionTitle}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {modules.map((m) => (
          <div
            key={m.id}
            onClick={() => onNavigate(m.id)}
            style={{
              background: 'rgba(15, 23, 42, 0.3)',
              backdropFilter: 'blur(6px)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#38bdf8';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(56, 189, 248, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                <span style={{ background: 'rgba(9, 9, 11, 0.6)', color: '#38bdf8', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #1e293b' }}>
                  {m.category}
                </span>
              </div>
              <h4 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '1rem' }}>{m.title}</h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>{m.desc}</p>
            </div>

            <div style={{ marginTop: '16px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t.homeOpenModuleBtn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};