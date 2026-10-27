import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth.js';

interface LoginOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginOtpModal: React.FC<LoginOtpModalProps> = ({ isOpen, onClose }) => {
  const { requestOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const ok = await requestOtp(email);
    setLoading(false);
    if (ok) setStep('OTP');
    else setErrorMsg('Error al despachar el código. Intenta de nuevo.');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const ok = await verifyOtp(email, code);
    setLoading(false);
    if (ok) onClose();
    else setErrorMsg('Código incorrecto o expirado.');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.78)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#090d16',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(2, 132, 199, 0.25)',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{step === 'EMAIL' ? '🔑' : '✉️'}</span>
              <span>{step === 'EMAIL' ? 'Acceso Seguro Passwordless' : 'Ingresa tu Código OTP'}</span>
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              {step === 'EMAIL'
                ? 'Ingresa tu correo para recibir un código de un solo uso (OTP).'
                : `Código temporal enviado a: ${email}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer', padding: '2px 6px' }}
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Correo Corporativo
              </label>
              <input
                type="email"
                required
                placeholder="auditor@qa-sec.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(2, 6, 23, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ backgroundColor: 'transparent', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8', borderRadius: '8px', padding: '9px 16px', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#0369a1' : '#0284c7',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 14px rgba(2, 132, 199, 0.4)',
                }}
              >
                {loading ? 'Enviando OTP...' : 'Solicitar Código'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                Código numérico de 6 dígitos
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(2, 6, 23, 0.95)',
                  border: '1px solid #0284c7',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#38bdf8',
                  fontSize: '1.4rem',
                  fontFamily: 'monospace',
                  letterSpacing: '10px',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ← Cambiar email
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#0369a1' : '#0284c7',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 14px rgba(2, 132, 199, 0.4)',
                }}
              >
                {loading ? 'Validando...' : 'Verificar y Entrar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};