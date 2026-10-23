import React, { useState } from 'react';
import type { FindingDetail, ReportData } from './report/report.types';
import { AiSummaryBanner } from './report/AiSummaryBanner';
import { FindingCard } from './report/FindingCard';
import { ReportModals } from './report/ReportModals';
import { ReportExportActions } from './report/ReportExportActions';

export type { FindingDetail, ReportData };

interface Props {
  report: ReportData | null;
  currentTargetUrl: string;
}

export const ReportViewer: React.FC<Props> = ({ report, currentTargetUrl }) => {
  const [selectedFinding, setSelectedFinding] = useState<FindingDetail | null>(null);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState<{ title: string; evidenceText: string } | null>(null);

  if (!report) return null;

  const mappedFindings = report.findings.map((f) => ({
    title: f.title,
    severity: f.severity,
    description: f.description,
    recommendation: f.recommendation,
    evidence: f.evidence,
  }));

  return (
    <div
      style={{
        marginTop: '24px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        padding: '24px',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 20px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* CABECERA CON CONTROLES Y ACCIONES DE EXPORTACIÓN */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.25rem',
              color: '#ffffff',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: '#38bdf8' }}>📊</span> Reporte Transaccional de Análisis
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              ID: {report.runId}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
              Total de verificaciones realizadas: <strong style={{ color: '#f8fafc' }}>{report.findingsCount}</strong>
            </span>
          </div>
        </div>

        <ReportExportActions
          title={`Reporte de Auditoría - Run ID: ${report.runId}`}
          targetUrl={currentTargetUrl}
          summary={report.aiSummary?.executiveSummary || 'Auditoría transaccional de seguridad ejecutada exitosamente.'}
          findings={mappedFindings}
        />
      </div>

      {/* RESUMEN EJECUTIVO DE GEMINI AI */}
      {report.aiSummary && <AiSummaryBanner summary={report.aiSummary} />}

      {/* SECCIÓN DE HALLAZGOS TÉCNICOS */}
      <h3
        style={{
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          paddingBottom: '10px',
          marginTop: '24px',
          marginBottom: '20px',
          color: '#f8fafc',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🔍 Trazabilidad y Hallazgos Técnicos ({report.findings.length})
      </h3>

      {/* LISTA DE CARDS DE HALLAZGOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {report.findings.map((item, index) => (
          <FindingCard
            key={item.findingId || index}
            item={item}
            currentTargetUrl={currentTargetUrl}
            onSelectFinding={setSelectedFinding}
            onSelectEvidence={setSelectedEvidenceModal}
          />
        ))}
      </div>

      {/* MODALES DE EVIDENCIA Y DETALLE */}
      <ReportModals
        selectedEvidenceModal={selectedEvidenceModal}
        selectedFinding={selectedFinding}
        currentTargetUrl={currentTargetUrl}
        onCloseEvidenceModal={() => setSelectedEvidenceModal(null)}
        onCloseFindingModal={() => setSelectedFinding(null)}
      />
    </div>
  );
};