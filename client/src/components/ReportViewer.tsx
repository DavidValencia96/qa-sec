import React, { useState } from 'react';
import type { FindingDetail, ReportData } from './report/report.types';
import { AiSummaryBanner } from './report/AiSummaryBanner';
import { FindingCard } from './report/FindingCard';
import { ReportModals } from './report/ReportModals';

export type { FindingDetail, ReportData };

interface Props {
  report: ReportData | null;
  currentTargetUrl: string;
}

export const ReportViewer: React.FC<Props> = ({ report, currentTargetUrl }) => {
  const [selectedFinding, setSelectedFinding] = useState<FindingDetail | null>(null);
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState<{ title: string; evidenceText: string } | null>(null);

  if (!report) return null;

  return (
    <div style={{ marginTop: '24px', background: '#111827', padding: '20px', borderRadius: '8px', border: '1px solid #1f2937', maxWidth: '1200px', margin: '24px auto 0 auto' }}>
      <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#f9fafb' }}>📊 Reporte Transaccional de Análisis (ID: {report.runId})</h2>
      <p style={{ color: '#9ca3af', margin: '0 0 16px 0', fontSize: '13px' }}>
        Total de verificaciones realizadas: <strong>{report.findingsCount}</strong>
      </p>

      {report.aiSummary && <AiSummaryBanner summary={report.aiSummary} />}

      <h3 style={{ borderBottom: '1px solid #374151', paddingBottom: '8px', marginTop: '16px', color: '#e5e7eb', fontSize: '16px' }}>
        Trazabilidad y Hallazgos Técnicos
      </h3>

      {report.findings.map((item, index) => (
        <FindingCard
          key={item.findingId || index}
          item={item}
          currentTargetUrl={currentTargetUrl}
          onSelectFinding={setSelectedFinding}
          onSelectEvidence={setSelectedEvidenceModal}
        />
      ))}

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