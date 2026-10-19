import React from 'react';
import { exportSingleRecordApi } from '../../services/api.client';

export interface ScaHistoryItem {
  id: string;
  manifestType: string;
  totalDepsAudited: number;
  vulnerabilitiesJson?: string;
  gitSecretsJson?: string;
  aiSummaryJson?: string;
  createdAt: string;
}

interface ScaHistoryTableProps {
  items: ScaHistoryItem[];
}

export const ScaHistoryTable: React.FC<ScaHistoryTableProps> = ({ items }) => {
  const handleExport = async (item: ScaHistoryItem) => {
    try {
      const vulnerabilities = item.vulnerabilitiesJson ? JSON.parse(item.vulnerabilitiesJson) : [];
      const gitSecrets = item.gitSecretsJson ? JSON.parse(item.gitSecretsJson) : [];
      const aiSummary = item.aiSummaryJson ? JSON.parse(item.aiSummaryJson) : {};

      await exportSingleRecordApi({
        moduleType: 'sca',
        recordData: {
          id: item.id,
          manifestType: item.manifestType,
          totalDependenciesAudited: item.totalDepsAudited,
          vulnerabilities,
          gitSecrets,
          aiSummary,
          createdAt: item.createdAt,
        },
        format: 'html',
      });
    } catch (err) {
      alert(`Error al exportar reporte SCA: ${(err as Error).message}`);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f4f4f5', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: '#18181b', borderBottom: '1px solid #27272a', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID Ejecución</th>
            <th style={{ padding: '12px' }}>Manifest</th>
            <th style={{ padding: '12px' }}>Líneas/Deps</th>
            <th style={{ padding: '12px' }}>Vulnerabilidades</th>
            <th style={{ padding: '12px' }}>Secretos Git</th>
            <th style={{ padding: '12px' }}>Fecha</th>
            <th style={{ padding: '12px' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#a1a1aa' }}>
                No se registran auditorías SCA en el historial.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const vulns = item.vulnerabilitiesJson ? JSON.parse(item.vulnerabilitiesJson) : [];
              const secrets = item.gitSecretsJson ? JSON.parse(item.gitSecretsJson) : [];

              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: '#38bdf8' }}>{item.id}</td>
                  <td style={{ padding: '12px' }}>{item.manifestType}</td>
                  <td style={{ padding: '12px' }}>{item.totalDepsAudited}</td>
                  <td style={{ padding: '12px', color: vulns.length > 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                    {vulns.length} Detectadas
                  </td>
                  <td style={{ padding: '12px', color: secrets.length > 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                    {secrets.length} Expuestos
                  </td>
                  <td style={{ padding: '12px', color: '#a1a1aa' }}>
                    {new Date(item.createdAt).toLocaleString('es-ES')}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      type="button"
                      onClick={() => handleExport(item)}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      📄 Ver / Exportar
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};