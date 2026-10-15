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
    <div style={{ marginTop: '24px', background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
      <h2>📊 Reporte de Análisis (ID: {report.runId})</h2>
      <p style={{ color: '#9ca3af' }}>Total de hallazgos detectados: <strong>{report.findingsCount}</strong></p>

      {report.aiSummary && <AiSummaryBanner summary={report.aiSummary} />}

      <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '8px' }}>Hallazgos Técnicos</h3>

      {report.findings.map((item, index) => (
        <FindingCard
          key={index}
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