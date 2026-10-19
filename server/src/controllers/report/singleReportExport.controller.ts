import type { Request, Response } from 'express';
import type { DastFinding } from '../../modules/dast/dast.types.js';

export const exportSingleRecordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleType, recordData } = req.body;

    if (!moduleType || !recordData) {
      res.status(400).json({ success: false, error: 'moduleType y recordData son requeridos.' });
      return;
    }

    const title = `Reporte_${moduleType.toUpperCase()}_${recordData.id || recordData.runId || 'Audit'}`;
    const dateStr = new Date(recordData.createdAt || Date.now()).toLocaleString('es-ES');

    let htmlBody = '';

    if (moduleType === 'load-test') {
      const metrics = recordData.metrics || {};
      const breakdown = metrics.statusBreakdown || {};
      const total = recordData.totalRequests || 1;

      // Porcentajes para el gráfico visual de respuestas
      const p2xx = Math.round(((breakdown.status2xx || 0) / total) * 100);
      const p429 = Math.round(((breakdown.status429RateLimited || 0) / total) * 100);
      const p4xx = Math.round(((breakdown.status4xx || 0) / total) * 100);
      const p5xx = Math.round(((breakdown.status5xx || 0) / total) * 100);
      const pTimeout = Math.round(((breakdown.timeouts || 0) / total) * 100);

      const rawPayload = recordData.payloadJson || recordData.config?.payloadJson;
      const payloadText = rawPayload && String(rawPayload).trim().length > 0 ? String(rawPayload) : null;

      const rawHeaders = recordData.headersJson || recordData.config?.headersJson;
      const headersText = rawHeaders && String(rawHeaders).trim().length > 0 ? String(rawHeaders) : null;

      htmlBody = `
        <div style="border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🎯 Reporte Técnico - Prueba de Carga & Resiliencia DoS</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- ⚙️ CONFIGURACIÓN Y PARÁMETROS DE EJECUCIÓN -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
            ⚙️ Parametrización de la Carga Simulada
          </h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem; margin-bottom: 16px;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">URL Objetivo Endpoint:</span>
              <strong style="color: #f8fafc; word-break: break-all;">${recordData.targetUrl}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Método HTTP:</span>
              <span style="background: #1e293b; color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #334155;">
                ${recordData.method}
              </span>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Clientes Concurrentes:</span>
              <strong style="color: #38bdf8;">${recordData.concurrency} clientes simultáneos</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Duración del Ataque:</span>
              <strong style="color: #facc15;">${recordData.durationSeconds} segundos</strong>
            </div>
          </div>

          <!-- MUESTRA DE CABECERAS HTTP -->
          <div style="padding-top: 14px; border-top: 1px solid #1e293b; margin-bottom: 12px;">
            <span style="color: #94a3b8; display: block; font-size: 0.8rem; margin-bottom: 6px;">
              🔑 Cabeceras HTTP Personalizadas (Headers):
            </span>
            ${headersText ? `
              <pre style="background: #020617; color: #38bdf8; padding: 10px 12px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 0.85rem; margin: 0; overflow-x: auto;">${headersText}</pre>
            ` : `
              <div style="background: #020617; color: #64748b; padding: 8px 12px; border-radius: 6px; border: 1px dashed #334155; font-size: 0.85rem; font-style: italic;">
                Sin cabeceras personalizadas adicionales (Standard Headers).
              </div>
            `}
          </div>

          <!-- MUESTRA DE PAYLOAD -->
          <div style="padding-top: 12px; border-top: 1px solid #1e293b;">
            <span style="color: #94a3b8; display: block; font-size: 0.8rem; margin-bottom: 6px;">
              📦 Payload HTTP Enviado (Body / Data):
            </span>
            ${payloadText ? `
              <pre style="background: #020617; color: #4ade80; padding: 10px 12px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 0.85rem; margin: 0; overflow-x: auto; max-height: 200px;">${payloadText}</pre>
            ` : `
              <div style="background: #020617; color: #64748b; padding: 8px 12px; border-radius: 6px; border: 1px dashed #334155; font-size: 0.85rem; font-style: italic;">
                Petición ejecutada sin cuerpo de datos (No Payload).
              </div>
            `}
          </div>
        </div>

        <!-- 🤖 SÍNTESIS EJECUTIVA DE GEMINI AI -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #38bdf8; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 1.05rem;">🤖 Diagnóstico de Resiliencia IA (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${recordData.aiDiagnosis?.summary || 'Se ejecutó la prueba de estrés evaluando la respuesta del servidor.'}
          </p>
        </div>

        <!-- 📊 MÉTRICAS OBTENIDAS -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #0f172a; padding: 14px; border-radius: 6px; text-align: center; border: 1px solid #334155;">
            <span style="font-size: 0.8rem; color: #94a3b8;">Total Peticiones</span>
            <div style="font-size: 1.4rem; font-weight: bold; color: #38bdf8; margin-top: 4px;">${recordData.totalRequests}</div>
          </div>
          <div style="background: #0f172a; padding: 14px; border-radius: 6px; text-align: center; border: 1px solid #334155;">
            <span style="font-size: 0.8rem; color: #94a3b8;">RPS Sostenido</span>
            <div style="font-size: 1.4rem; font-weight: bold; color: #a855f7; margin-top: 4px;">${recordData.rps} req/s</div>
          </div>
          <div style="background: #0f172a; padding: 14px; border-radius: 6px; text-align: center; border: 1px solid #334155;">
            <span style="font-size: 0.8rem; color: #94a3b8;">Latencia Promedio</span>
            <div style="font-size: 1.4rem; font-weight: bold; color: #facc15; margin-top: 4px;">${recordData.avgLatencyMs} ms</div>
          </div>
          <div style="background: #0f172a; padding: 14px; border-radius: 6px; text-align: center; border: 1px solid #334155;">
            <span style="font-size: 0.8rem; color: #94a3b8;">Latencia p95</span>
            <div style="font-size: 1.4rem; font-weight: bold; color: #f97316; margin-top: 4px;">${recordData.p95LatencyMs} ms</div>
          </div>
        </div>

        <!-- 📈 GRÁFICO DE DISTRIBUCIÓN -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 1rem;">📊 Distribución Proporcional de Respuestas HTTP</h3>
          
          <div style="display: flex; height: 24px; border-radius: 6px; overflow: hidden; background: #1e293b; margin-bottom: 12px;">
            <div style="width: ${p2xx}%; background: #22c55e;" title="2xx Exitosas (${p2xx}%)"></div>
            <div style="width: ${p429}%; background: #38bdf8;" title="429 Rate Limit (${p429}%)"></div>
            <div style="width: ${p4xx}%; background: #facc15;" title="4xx Cliente (${p4xx}%)"></div>
            <div style="width: ${p5xx}%; background: #ef4444;" title="5xx Servidor (${p5xx}%)"></div>
            <div style="width: ${pTimeout}%; background: #a855f7;" title="Timeouts (${pTimeout}%)"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #cbd5e1; flex-wrap: wrap; gap: 8px;">
            <span><strong style="color: #22c55e;">■ 2xx Exitosas:</strong> ${breakdown.status2xx || 0} (${p2xx}%)</span>
            <span><strong style="color: #38bdf8;">■ 429 Rate Limit:</strong> ${breakdown.status429RateLimited || 0} (${p429}%)</span>
            <span><strong style="color: #facc15;">■ 4xx Errores:</strong> ${breakdown.status4xx || 0} (${p4xx}%)</span>
            <span><strong style="color: #ef4444;">■ 5xx Caídas:</strong> ${breakdown.status5xx || 0} (${p5xx}%)</span>
            <span><strong style="color: #a855f7;">■ Timeouts:</strong> ${breakdown.timeouts || 0} (${pTimeout}%)</span>
          </div>
        </div>

        <!-- 💡 RECOMENDACIONES -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Recomendaciones Defensivas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(recordData.aiDiagnosis?.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (moduleType === 'dast') {
      const findings: DastFinding[] = recordData.findings || [];
      const aiSummary = recordData.aiSummary || {};

      htmlBody = `
        <div style="border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🛡️ Reporte Técnico - Auditoría DAST & API Fuzzing</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- PARAMETRIZACIÓN DAST -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">⚙️ Parámetros de Escaneo Dinámico</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">URL Base Objetivo:</span>
              <strong style="color: #f8fafc; word-break: break-all;">${recordData.targetBaseUrl}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Endpoints Evaluados:</span>
              <strong style="color: #38bdf8;">${recordData.totalTestedEndpoints || 0} endpoints</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Total Hallazgos:</span>
              <strong style="color: ${findings.length > 0 ? '#ef4444' : '#22c55e'};">${findings.length} hallazgos</strong>
            </div>
          </div>
        </div>

        <!-- SÍNTESIS GEMINI IA -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #38bdf8; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo DAST (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${aiSummary.summary || 'Escaneo dinámico de APIs completado.'}
          </p>
        </div>

        <!-- TABLA DE HALLAZGOS DAST -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🔍 Hallazgos de Seguridad Detectados (${findings.length})</h3>
          ${findings.length === 0 ? `
            <p style="color: #4ade80; margin: 0;">✅ No se detectaron vulnerabilidades de BOLA ni inyecciones de cabeceras.</p>
          ` : findings.map((f) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid ${f.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #f8fafc;">[${f.vulnerabilityType}] ${f.httpMethod}${f.endpointPath}</strong>
                <span style="background: #0f172a; color: ${f.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                  ${f.severity}
                </span>
              </div>
              <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0 0 8px 0;">${f.description}</p>
              <div style="background: #020617; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #38bdf8; word-break: break-all;">
                Evidence: ${f.evidencePayload}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- RECOMENDACIONES -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Recomendaciones Defensivas DAST</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(aiSummary.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (moduleType === 'sca') {
      const vulnerabilities = recordData.vulnerabilities || [];
      const gitSecrets = recordData.gitSecrets || [];
      const aiSummary = recordData.aiSummary || {};

      htmlBody = `
        <div style="border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🔐 Reporte Técnico - SCA & Supply Chain Security</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- PARAMETRIZACIÓN SCA -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">⚙️ Resumen de Análisis de Cadena de Suministro</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Tipo de Manifest:</span>
              <strong style="color: #f8fafc;">${recordData.manifestType || 'package_json'}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Líneas / Dependencias Auditadas:</span>
              <strong style="color: #38bdf8;">${recordData.totalDependenciesAudited || 0}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Vulnerabilidades Encontradas:</span>
              <strong style="color: ${vulnerabilities.length > 0 ? '#ef4444' : '#22c55e'};">${vulnerabilities.length}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Secretos Expuestos:</span>
              <strong style="color: ${gitSecrets.length > 0 ? '#ef4444' : '#22c55e'};">${gitSecrets.length}</strong>
            </div>
          </div>
        </div>

        <!-- SÍNTESIS GEMINI IA -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #38bdf8; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo SCA (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${aiSummary.summary || 'Análisis de dependencias y secretos Git completado.'}
          </p>
        </div>

        <!-- VULNERABILIDADES DE DEPENDENCIAS -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">📦 Vulnerabilidades en Dependencias (${vulnerabilities.length})</h3>
          ${vulnerabilities.length === 0 ? `
            <p style="color: #4ade80; margin: 0;">✅ No se detectaron vulnerabilidades conocidas en las dependencias.</p>
          ` : vulnerabilities.map((v: any) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid ${v.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #f8fafc;">${v.packageName} (v${v.currentVersion})${v.cveId ? `— ${v.cveId}` : ''}</strong>
                <span style="background: #0f172a; color: ${v.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                  ${v.severity}
                </span>
              </div>
              <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0 0 8px 0;">${v.description}</p>${v.patchedVersion ? `<div style="color: #4ade80; font-size: 0.85rem; font-weight: bold;">💡 Versión Sugerida: ${v.patchedVersion}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- SECRETOS Y CREDENCIALES -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 1rem;">🔑 Secretos & Credenciales Expuestas (${gitSecrets.length})</h3>
          ${gitSecrets.length === 0 ? `
            <p style="color: #4ade80; margin: 0;">✅ No se detectaron tokens ni claves expuestas.</p>
          ` : gitSecrets.map((s: any) => `
            <div style="background: #1e293b; padding: 14px; border-radius: 6px; border-left: 4px solid #ef4444; margin-bottom: 12px;">
              <strong style="color: #f8fafc;">[${s.secretType}]${s.filePath}</strong>
              <div style="background: #020617; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #fca5a5; word-break: break-all; margin-top: 6px;">
                Patrón: ${s.matchedPattern}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- RECOMENDACIONES -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Acciones Correctivas Recomendadas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(aiSummary.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (moduleType === 'easm') {
      const subdomains = recordData.subdomains || [];
      const wafAndTech = recordData.wafAndTech || {};
      const sslDetails = recordData.sslDetails || {};
      const aiSummary = recordData.aiSummary || {};

      htmlBody = `
        <div style="border-bottom: 2px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #38bdf8;">🕸️ Reporte Técnico - External Attack Surface Management</h2>
          <span style="color: #94a3b8; font-size: 0.9rem;">
            ID de Auditoría: <strong>${recordData.id || recordData.runId || 'N/A'}</strong> | Fecha: ${dateStr}
          </span>
        </div>

        <!-- PARAMETRIZACIÓN -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 1.05rem;">🌐 Resumen del Perímetro Expuesto</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; font-size: 0.9rem;">
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Dominio Objetivo:</span>
              <strong style="color: #f8fafc;">${recordData.targetDomain}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Subdominios Descubiertos:</span>
              <strong style="color: #38bdf8;">${subdomains.length}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">WAF Detectado:</span>
              <strong style="color: ${wafAndTech.wafDetected ? '#22c55e' : '#facc15'};">${wafAndTech.wafDetected ? wafAndTech.wafName || 'Sí' : 'No Detectado'}</strong>
            </div>
            <div>
              <span style="color: #94a3b8; display: block; font-size: 0.8rem;">Estado SSL/TLS:</span>
              <strong style="color: ${sslDetails.valid ? '#22c55e' : '#ef4444'};">${sslDetails.valid ? 'Válido' : 'Inválido'}</strong>
            </div>
          </div>
        </div>

        <!-- DIAGNÓSTICO IA -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #38bdf8; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 1.05rem;">🤖 Diagnóstico Ejecutivo EASM (Gemini AI)</h3>
          <p style="margin: 0; color: #e2e8f0; font-size: 0.95rem; line-height: 1.5;">
            ${aiSummary.summary || 'Análisis de la superficie de ataque completado.'}
          </p>
        </div>

        <!-- RECOMENDACIONES -->
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155;">
          <h3 style="margin: 0 0 12px 0; color: #38bdf8; font-size: 1rem;">💡 Acciones Defensivas Recomendadas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
            ${(aiSummary.recommendations || []).map((r: string) => `<li style="margin-bottom: 6px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    } else {
      htmlBody = `<h2>Reporte de auditoría estándar</h2>`;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; }
    .card { background: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155; max-width: 900px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .btn-print { background: #0284c7; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    @media print { .no-print { display: none !important; } body { background: white !important; color: black !important; padding: 0 !important; } .card { border: none !important; box-shadow: none !important; padding: 0 !important; } }
  </style>
</head>
<body>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;" class="no-print">
      <span style="color: #94a3b8; font-weight: bold;">🛡️ QA-Sec Suite — Informe Técnico Individual</span>
      <button class="btn-print" onclick="window.print()">🖨️ Guardar PDF / Imprimir</button>
    </div>
    ${htmlBody}
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.html"`);
    res.status(200).send(fullHtml);
  } catch (error) {
    console.error('[!] Error en exportSingleRecordHandler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};