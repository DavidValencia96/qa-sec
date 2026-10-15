import React, { useState, useEffect } from 'react';
import { getHistoryApi, getReportApi } from '../services/api.client';
import type { ReportData } from './ReportViewer';
import type { HistoryItem } from './history/history.types';
import { HistoryTable } from './history/HistoryTable';
import { ReportModal } from './history/ReportModal';


export type { HistoryItem };

export const ReportHistory: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para el Modal del Reporte
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedTargetUrl, setSelectedTargetUrl] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await getHistoryApi();
        if (isMounted && data.success && Array.isArray(data.history)) {
          setItems(data.history);
        }
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenReportModal = async (item: HistoryItem) => {
    setLoadingReport(true);
    setSelectedTargetUrl(item.targetUrl || '');
    try {
      const data = await getReportApi(item.runId);
      setSelectedReport(data as ReportData);
    } catch (err) {
      alert(`Error al obtener el reporte: ${(err as Error).message}`);
    } finally {
      setLoadingReport(false);
    }
  };

  const filterItem = (item: HistoryItem, query: string) => {
    const q = query.toLowerCase();
    return (
      item.runId?.toLowerCase().includes(q) ||
      item.projectName?.toLowerCase().includes(q) ||
      item.suiteName?.toLowerCase().includes(q) ||
      item.targetUrl?.toLowerCase().includes(q) ||
      item.auditType?.toLowerCase().includes(q)
    );
  };

  const filteredItems = items.filter((i) => filterItem(i, searchTerm));

  if (loading) {
    return <div style={{ color: '#aaa', padding: '20px' }}>Cargando historial de MySQL...</div>;
  }

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ color: '#fff', marginTop: 0, fontSize: '20px' }}>📜 Historial de Ejecuciones de Seguridad</h2>

      <input
        type="text"
        placeholder="🔍 Buscar por ID, Tipo, Proyecto, Suite o URL..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '6px',
          border: '1px solid #333',
          background: '#09090b',
          color: '#fff',
          fontSize: '14px',
          marginBottom: '20px',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      <HistoryTable items={filteredItems} onOpenReportModal={handleOpenReportModal} />

      <ReportModal
        report={selectedReport}
        targetUrl={selectedTargetUrl}
        loading={loadingReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};