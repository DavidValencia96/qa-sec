import React, { useState } from 'react';
import { runRedTeamAuditApi, exportSingleRecordApi } from '../../services/api.client';

interface JwtFindingItem {
  vulnerabilityType: string;
  severity: string;
  description: string;
  remediation: string;
}

interface CorsFindingItem {
  vulnerabilityType: string;
  testedOrigin: string;
  description: string;
  remediation: string;
}

interface RedTeamAuditResult {
  runId?: string;
  phishingSimulatedCount?: number;
  aiSummary?: {
    summary: string;
  };
  jwtFindings?: JwtFindingItem[];
  corsFindings?: CorsFindingItem[];
}

export const RedTeamAuditTab: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000/api/users');
  const [jwtToken, setJwtToken] = useState('');
  const [enableJwt, setEnableJwt] = useState(true);
  const [enableCors, setEnableCors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedTeamAuditResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await runRedTeamAuditApi({
        targetUrl,
        jwtToken,
        enableJwtScanner: enableJwt,
        enableCorsExploiter: enableCors,
        enablePhishingSimulator: false,
      });
      setResult(data as RedTeamAuditResult);
    } catch (err) {
      alert(`Error al auditar Red Team: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSingleReport = async () => {
    if (!result) return;
    try {
      await exportSingleRecordApi({
        moduleType: 'redteam',
        recordData: {
          id: result.runId,
          targetUrl,
          jwtToken: jwtToken || null, // <-- Garantiza pasar el token ingresado al generador HTML
          jwtFindings: result.jwtFindings || [],
          corsFindings: result.corsFindings || [],
          phishingSimulatedCount: result.phishingSimulatedCount || 0,
          aiSummary: result.aiSummary,
          createdAt: new Date().toISOString(),
        },
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar reporte individual: ${(err as Error).message}`);
    }
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '24px', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ color: '#fff', marginTop: 0 }}>⚔️ Red Team & Simulación de Infiltración</h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
        Pruebas de explotación activa: Manipulación de firmas JWT, mala configuración de CORS y phishing simulado.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>URL Endpoint Objetivo:</label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Token JWT Objetivo (Opcional):</label>
          <textarea
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            rows={3}
            style={{ width: '100%', padding: '10px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <label style={{ color: '#fff', cursor: 'pointer' }}>
            <input type="checkbox" checked={enableJwt} onChange={(e) => setEnableJwt(e.target.checked)} /> Escáner de Vulnerabilidades JWT
          </label>
          <label style={{ color: '#fff', cursor: 'pointer' }}>
            <input type="checkbox" checked={enableCors} onChange={(e) => setEnableCors(e.target.checked)} /> Explotación CORS Misconfiguration
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#3f3f46' : '#2563eb',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Explotando vulnerabilidades...' : '🚀 Iniciar Ataque Red Team'}
        </button>
      </form>

      {result && (
        <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#38bdf8', margin: 0 }}>📊 Resultados del Análisis Red Team</h3>
            <button
              type="button"
              onClick={handleExportSingleReport}
              style={{
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              📥 Exportar Informe HTML / PDF
            </button>
          </div>

          <p style={{ color: '#cbd5e1' }}>{result.aiSummary?.summary}</p>

          <h4 style={{ color: '#f8fafc' }}>🔑 Vulnerabilidades JWT ({result.jwtFindings?.length || 0}):</h4>
          {result.jwtFindings?.length === 0 ? (
            <p style={{ color: '#22c55e' }}>✅ No se encontraron vulnerabilidades JWT explotables.</p>
          ) : (
            result.jwtFindings?.map((f: JwtFindingItem, idx: number) => (
              <div key={idx} style={{ background: '#18181b', padding: '12px', borderRadius: '6px', marginBottom: '8px', borderLeft: '4px solid #ef4444' }}>
                <strong style={{ color: '#ef4444' }}>[{f.vulnerabilityType}] {f.severity}</strong>
                <p style={{ color: '#cbd5e1', margin: '4px 0' }}>{f.description}</p>
                <small style={{ color: '#94a3b8' }}>Remediación: {f.remediation}</small>
              </div>
            ))
          )}

          <h4 style={{ color: '#f8fafc', marginTop: '16px' }}>🌐 Malas Configuraciones CORS ({result.corsFindings?.length || 0}):</h4>
          {result.corsFindings?.length === 0 ? (
            <p style={{ color: '#22c55e' }}>✅ Las políticas CORS son estrictamente seguras.</p>
          ) : (
            result.corsFindings?.map((f: CorsFindingItem, idx: number) => (
              <div key={idx} style={{ background: '#18181b', padding: '12px', borderRadius: '6px', marginBottom: '8px', borderLeft: '4px solid #f97316' }}>
                <strong style={{ color: '#f97316' }}>[{f.vulnerabilityType}] Origen Explotado: {f.testedOrigin}</strong>
                <p style={{ color: '#cbd5e1', margin: '4px 0' }}>{f.description}</p>
                <small style={{ color: '#94a3b8' }}>Remediación: {f.remediation}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};