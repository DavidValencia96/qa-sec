import React from 'react';
import type { TabType } from './dashboard.types';

interface HomeTabProps {
  onNavigate: (tab: TabType) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigate }) => {
  const modules = [
    { id: 'scanner' as TabType, title: 'Escáner & Diseñador IA', icon: '🚀', desc: 'Fuzzing de parámetros web y generación de suites con IA.', category: 'Web App Security' },
    { id: 'injection' as TabType, title: 'Inyección & Inputs Sec', icon: '🎯', desc: 'Auditoría defensiva de sanitización y bypass en formularios.', category: 'Input Security' },
    { id: 'network' as TabType, title: 'Configuración de Red', icon: '🛡️', desc: 'Análisis de puertos TCP expuestos y superficie de perímetro.', category: 'Infrastructure' },
    { id: 'cve' as TabType, title: 'CiberThreat Feed & CVE Radar', icon: '📰', desc: 'Monitoreo NVD/CVE en tiempo real y diagnóstico IA.', category: 'Threat Intel' },
    { id: 'sast' as TabType, title: 'Auditoría SAST & Secret Scanning', icon: '🔍', desc: 'Análisis estático de código fuente y fuga de credenciales.', category: 'Code Security' },
    { id: 'load-test' as TabType, title: 'Pruebas de Carga & DoS', icon: '💥', desc: 'Simulación de estrés masivo y validación de Rate Limiting.', category: 'Resilience' },
    { id: 'dast' as TabType, title: 'DAST & OpenAPI Fuzzer', icon: '🛡️', desc: 'Pruebas dinámicas en APIs (BOLA/IDOR e inyecciones HTTP).', category: 'API Security' },
    { id: 'sca' as TabType, title: 'SCA & Supply Chain Sec', icon: '🔐', desc: 'Auditoría de librerías vulnerables e historial de commits Git.', category: 'Supply Chain' },
    { id: 'easm' as TabType, title: 'EASM & Recon OSINT', icon: '🕸️', desc: 'Descubrimiento de subdominios, certificados SSL y WAF.', category: 'Reconnaissance' },
    { id: 'redteam' as TabType, title: 'Red Team & Explotación', icon: '⚔️', desc: 'Simulador de firma JWT, bypass CORS y phishing.', category: 'Offensive Security' },
    { id: 'emailsec' as TabType, title: 'Email Sec & OSINT', icon: '📧', desc: 'Inspección de registros SPF/DMARC, RBL y forensia .eml.', category: 'Email Security' },
    { id: 'compliance' as TabType, title: 'Compliance Radar', icon: '📊', desc: 'Mapeo contra OWASP Top 10, ISO 27001 y NIST SP 800-53.', category: 'Governance' },
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
            <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>SYSTEM OPERATIONAL • ALL MODULES READY</span>
          </div>

          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            QA-Sec Suite <span style={{ color: '#38bdf8' }}>DevSecOps Engine</span>
          </h1>

          <p style={{ color: '#e2e8f0', fontSize: '1.05rem', maxWidth: '750px', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            Plataforma modular de auditoría ofensiva y defensiva impulsada por Gemini AI. Evalúa vulnerabilidades en tiempo real, verifica el cumplimiento normativo y asegura el ciclo de vida del software.
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
              🚀 Iniciar Auditoría Web
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
              📊 Ver Compliance Radar
            </button>
          </div>
        </div>
      </div>

      {/* METRICAS RAPIDAS DE CABECERA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'MÓDULOS DE AUDITORÍA', val: '12 Activos', color: '#fff' },
          { label: 'MOTOR DE IA', val: 'Gemini AI 3.x', color: '#38bdf8' },
          { label: 'INTEGRACIÓN CI/CD', val: 'qa-sec-cli', color: '#22c55e' },
          { label: 'MARCOS NORMATIVOS', val: 'OWASP - ISO - NIST', color: '#facc15' },
        ].map((kpi, idx) => (
          <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(6px)', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>{kpi.label}</span>
            <strong style={{ color: kpi.color, fontSize: '1.8rem' }}>{kpi.val}</strong>
          </div>
        ))}
      </div>

      {/* GRID DE CARDS TRANSPARENTES */}
      <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚙️ Módulos de Auditoría & Análisis Espacial
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
              Abrir Módulo ➔
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};