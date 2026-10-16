import type { ReportExportRequestDTO } from '../../modules/report/reportExport.types.js';

export class ReportFormatterService {
  public generateMarkdown(data: ReportExportRequestDTO): string {
    const findingsMd = data.findings
      .map(
        (f, idx) => `
### ${idx + 1}. [${f.severity}] ${f.title}
* **Descripción:** ${f.description}
${f.recommendation ? `* **Recomendación:** ${f.recommendation}` : ''}
${f.evidence ? `* **Evidencia:** \`${f.evidence}\`` : ''}
`
      )
      .join('\n');

    return `
# 🛡️ Reporte Técnico de Seguridad — QA-Sec Suite

* **Título:** ${data.title}
${data.targetUrl ? `* **Objetivo de Auditoría:** ${data.targetUrl}` : ''}
* **Puntaje de Salud:** ${data.score !== undefined ? `${data.score}/100` : 'N/A'}
* **Fecha de Generación:** ${new Date().toLocaleString()}

---

## 📊 Resumen Ejecutivo
${data.summary}

---

## 🔍 Hallazgos y Vulnerabilidades Detectadas
${findingsMd || 'No se registraron hallazgos de severidad en esta auditoría.'}

${
  data.remediatedCode
    ? `
---

## ✨ Código / Configuración Refactorizada por IA
\`\`\`
${data.remediatedCode}
\`\`\`
`
    : ''
}
`.trim();
  }

  public generateHtml(data: ReportExportRequestDTO): string {
    const mdContent = this.generateMarkdown(data);
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${data.title} - QA-Sec Suite</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #f4f4f5; padding: 40px; line-height: 1.6; }
    h1, h2, h3 { color: #38bdf8; }
    hr { border-color: #27272a; margin: 24px 0; }
    pre { background: #18181b; padding: 16px; border-radius: 6px; color: #86efac; overflow-x: auto; }
    code { background: #27272a; padding: 2px 6px; border-radius: 4px; color: #f87171; }
  </style>
</head>
<body>
  <div>${mdContent.replace(/\n/g, '<br>')}</div>
</body>
</html>
`.trim();
  }
}